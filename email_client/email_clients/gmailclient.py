import os
import base64
import signal
import time
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

class GmailClient:
    """
    GmailClient class to connect to Gmail API and forward attachments of a specific file type.
    """
    def __init__(self, client_id, client_secret, token_path):
        """
        Initialize the GmailClient object.

        Args:
            client_id (str): The client ID for OAuth.
            client_secret (str): The client secret for OAuth.
            token_path (str): The path to store the token.
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_path = token_path
        self.service = None
        self.connected = False
        self.running = False

    def __authenticate(self):
        """
        Authenticate with the Gmail API using OAuth 2.0.
        """
        scopes = ['https://www.googleapis.com/auth/gmail.readonly']

        flow = InstalledAppFlow.from_client_secrets_file(
            self.client_id, scopes=scopes)
        credentials = flow.run_local_server(port=0)

        # Save the credentials to token file
        with open(self.token_path, 'w') as token:
            token.write(credentials.to_json())

    def __get_service(self):
        """
        Build and return a Gmail service object.
        """
        if os.path.exists(self.token_path):
            credentials = Credentials.from_authorized_user_file(self.token_path)
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
            else:
                self.__authenticate()
                credentials = Credentials.from_authorized_user_file(self.token_path)
            self.service = build('gmail', 'v1', credentials=credentials)
            self.connected = True
        else:
            self.__authenticate()
            return self.__get_service()
        
    def connect(self):
        """
        Connect to the Gmail API.
        """
        self.__get_service()
        
    def disconnect(self):
        """
        Disconnect from the Gmail API.
        """
        self.connected = False
        self.service = None
        

    def forward_attachments(self, file_type, user_id='me', query=''):
        """
        Forward attachments of a specific file type from emails.

        Args:
            service: The Gmail service object.
            user_id (str): User's email address or 'me' for the authenticated user.
            query (str): Query to filter emails (optional).
            
        Returns:
            True if new messages are found, False otherwise.
        """
        try:
            response = self.service.users().messages().list(userId=user_id, q=query + ' is:unread').execute()
            messages = response.get('messages', [])

            if not messages:
                print('No messages found.')
                return False
            
            else:
                for message in messages:
                    msg = self.service.users().messages().get(userId=user_id, id=message['id']).execute()
                    payload = msg['payload']
                    
                    #complete the code here
                    for part in payload['parts']:
                        if 'filename' in part['filename']:
                            file_data = base64.urlsafe_b64decode(part['body']['data'].encode('UTF-8'))
                            if part['filename'].lower().endswith(file_type.lower()):
                                file_path = os.path.join('.', part['filename'])
                                with open(file_path, 'wb') as f:
                                    f.write(file_data)
                                
                    self.service.users().messages().modify(userId=user_id, id=message['id'], body={'removeLabelIds': ['UNREAD']}).execute()
                return True

        except Exception as e:
            print("Error processing emails:", e)
            return False

    def stop(self, signum, frame):
        """
        Handle the stop signal.

        Args:
            signum (int): The signal number.
            frame (frame): The current stack frame.
        """
        self.disconnect()

    def watch(self, callback = None, query='has:attachment', timeout_seconds=300):
        """
        Watch for emails containing attachments of a specific file type.

        Args:
            callback (function): The callback function to execute after processing emails (default is None).
            query (str): Query to filter emails (optional).
            timeout_seconds (int): The number of seconds to wait between each iteration (default is 300).
        """
        signal.signal(signal.SIGINT, self.stop)
        signal.signal(signal.SIGTERM, self.stop)
        self.running = True

        while self.running:
            if not self.connected:
                self.connect()
            has_new_messages = self.forward_attachments(query=query)
            if callback and has_new_messages:
                callback()
            time.sleep(timeout_seconds)

