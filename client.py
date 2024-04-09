#import dotenv
import os
import sys
import time
import signal
from dotenv import load_dotenv
from email_clients.imapclient import IMAPClient
from email_clients.gmailclient import GmailClient
from utils.bulk_dmarc_reports import parse_dmarc_reports_dir
from utils.extract_gz import multiple_extract_gz
import ssl

client = None
attachment_dir = '.'
extracted_dir = '.'
parsed_dir = '.'

def signal_handler(sig, frame):
    print("Exiting...")
    client.running = False
    sys.exit(0)

#Define callback function to parse files from emails
def parse_dmarc_files():
    extracted_files = multiple_extract_gz(attachment_dir, extracted_dir)
    if not extracted_files:
        return []
    report_list = parse_dmarc_reports_dir(extracted_dir, move_files=True, parsed_dir=parsed_dir)
    return report_list
    
def watch_emails():
    client.watch(file_type='xml.gz', callback=parse_dmarc_files, save_directory=attachment_dir, timeout_seconds=300)
    
if __name__ == "__main__":
    load_dotenv()
    if len(sys.argv) < 2:
        print("Usage: python client.py <client_type>")
        sys.exit(1)
    
    client_type = sys.argv[1]
    if client_type == "imap":
        imap_server = os.getenv("IMAP_SERVER")
        imap_port = int(os.getenv("IMAP_PORT"))
        imap_username = os.getenv("IMAP_USERNAME")
        imap_password = os.getenv("IMAP_PASSWORD")
        client = IMAPClient(imap_server, imap_port, True, imap_username, imap_password)
    
    elif client_type == "gmail":
        client = GmailClient()
    
    attachment_dir = os.getenv("ATTACHMENTS_DIR")
    extracted_dir = os.getenv("EXTRACTED_DIR")
    parsed_dir = os.getenv("PARSED_DIR")
    
    if not os.path.exists(attachment_dir):
        os.makedirs(attachment_dir)
    if not os.path.exists(extracted_dir):
        os.makedirs(extracted_dir)
    if not os.path.exists(parsed_dir):
        os.makedirs(parsed_dir)
    
    watch_emails()
    