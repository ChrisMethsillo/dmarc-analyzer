
from abc import ABC, abstractmethod

class AbstractEmailClient(ABC):
    """
    Abstract class for an Email client.
    """

    @abstractmethod
    def connect(self):
        """
        Connect to the Email server.
        """
        raise NotImplementedError

    @abstractmethod
    def forward_attachments(self, file_type):
        """
        Forward attachments of a specific file type from emails in the specified folder.
        
        Args:
            file_type (str): The file type to forward (e.g., '.xml.gz').
            folder (str): The folder to search for emails (default is 'INBOX').
            search_criteria (str): The search criteria to filter emails (default is None).
            save_directory (str): The directory to save the attachments (default is '.').
        """
        raise NotImplementedError

    @abstractmethod
    def disconnect(self):
        """
        Disconnect from the Email server.
        """
        raise NotImplementedError

    @abstractmethod
    def watch(self, file_type, save_directory='.', timeout_seconds=300):
        """
        Watch the specified folder for emails containing attachments of a specific file type.
        
        Args:
            file_type (str): The file type to forward (e.g., '.xml.gz').
            save_directory (str): The directory to save the attachments (default is '.').
            timeout_seconds (int): The number of seconds to wait between each iteration (default is 300).
        """
        raise NotImplementedError
