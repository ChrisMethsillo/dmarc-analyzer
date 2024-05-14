from imap_tools import MailBox, MailBoxTls, A
import time
import signal
from email_clients.email_base import AbstractEmailClient
import ssl
import sys
import os

class IMAPClient(AbstractEmailClient):
    """
    IMAPClient class to connect to an IMAP server and forward attachments of a specific file type.
    """
    def __init__(self, host, port, mode, username, password):
        """
        Initialize the IMAPClient object.

        Args:
            host (str): The IMAP server host.
            port (int): The IMAP server port.
            ssl (bool): Whether to use SSL/TLS encryption.
            username (str): The username for authentication.
            password (str): The password for authentication.
        """
        self.host = host
        self.port = port
        self.mode = mode
        self.username = username
        self.password = password
        self.connected = False
        self.running = True

    # Implement the abstract methods
    def connect(self):
        """
        Connect to the IMAP server.
        """
        if self.mode == 'tls':
            self.mailbox = MailBoxTls(self.host, self.port)
            self.mailbox.login(self.username, self.password)
            self.connected = True
        
        else:
            try:
                self.mailbox = MailBox(self.host, self.port)
                self.mailbox.login(self.username, self.password)
                self.connected = True
            except Exception as e:
                print("Error connecting:", e)


            

    def forward_attachments(self, file_type, folder='INBOX', search_criteria=None, save_directory="."):
        """
        Forward attachments of a specific file type from emails in the specified folder.

        Args:
            file_type (str): The file type to forward (e.g., '.xml.gz').
            folder (str): The folder to search for emails (default is 'INBOX').
            search_criteria (str): The search criteria to filter emails (default is None).
            save_directory (str): The directory to save the attachments (default is '.').
        """
        try:
            has_new_messages = False
            
            self.mailbox.folder.folder = folder
            if search_criteria:
                self.mailbox.folder.search(search_criteria)

            for msg in self.mailbox.fetch():
                has_new_messages = True
                for att in msg.attachments:
                    if att.filename.lower().endswith(file_type.lower()):
                        file_path = os.path.join(save_directory, att.filename)
                        # Escribir los datos del archivo adjunto en el archivo local
                        with open(file_path, "wb") as f:
                            f.write(att.payload)

            return has_new_messages

        except Exception as e:
            print("Error processing emails:", e)
            return False

    def disconnect(self):
        """
        Disconnect from the IMAP server.
        """
        try:
            self.mailbox.logout()
        except Exception as e:
            print("Error disconnecting:", e)
            sys.exit(1)
            

    def stop(self, signum, frame):
        """
        Handle the stop signal.

        Args:
            signum (int): The signal number.
            frame (frame): The current stack frame.
        """
        try:
            self.running = False
            self.disconnect()
        except Exception as e:
            print("Error stopping:", e)
            sys.exit(1)

    def watch(self, file_type, callback = None, folder='INBOX', search_criteria=None, save_directory=".", timeout_seconds=300):
        """
        Watch the specified folder for emails containing attachments of a specific file type.

        Args:
            file_type (str): The file type to forward (e.g., '.xml.gz').
            folder (str): The folder to search for emails (default is 'INBOX').
            callback (function): The callback function to execute after processing emails (default is None).
            search_criteria (str): The search criteria to filter emails (default is None).
            save_directory (str): The directory to save the attachments (default is '.').
            timeout_seconds (int): The number of seconds to wait between each iteration (default is 300).
        """
        signal.signal(signal.SIGINT, self.stop)
        signal.signal(signal.SIGTERM, self.stop)
        self.running = True

        while self.running:
            if not self.connected:
                self.connect()
                
            has_new_message = self.forward_attachments(file_type, folder, search_criteria, save_directory)
            if callback and has_new_message:
                callback()
                
            time.sleep(timeout_seconds)