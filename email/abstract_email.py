from abc import ABC, abstractmethod

class EmailInbox(ABC):
    def __init__(self, email_user, email_pass, attachment_path):
        self.email_user = email_user
        self.email_pass = email_pass
        self.attachment_path = attachment_path
        
    @abstractmethod
    def connect(self):
        pass
    
    @abstractmethod
    def get_messages(self):
        pass
    
    @abstractmethod
    def disconnect(self):
        pass
        
