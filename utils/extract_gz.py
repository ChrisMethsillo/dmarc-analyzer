import gzip
import shutil
import os

def extract_gz(file_path, save_directory="."):
    """
    Extract a Gzip file to the specified directory.

    Args:
        file_path (str): The path to the Gzip file.
        save_directory (str): The directory to save the extracted file (default is '.').

    Returns:
        str: The path to the extracted file.
    """
    try:
        with gzip.open(file_path, 'rb') as f_in:
            extracted_file = os.path.join(save_directory, os.path.basename(file_path).replace('.gz', ''))
            with open(extracted_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
            return extracted_file
    except Exception as e:
        print("Error extracting Gzip file:", e)
        return None
    
def multiple_extract_gz(directory, save_directory="."):
    """
    Extract multiple Gzip files in a directory to the specified directory.

    Args:
        directory (str): The directory containing Gzip files.
        save_directory (str): The directory to save the extracted files (default is '.').

    Returns:
        list: A list of paths to the extracted files.
    """
    extracted_files = []
    for filename in os.listdir(directory):
        if filename.endswith('.gz'):
            gz_file = os.path.join(directory, filename)
            extracted_file = extract_gz(gz_file, save_directory)
            if extracted_file:
                extracted_files.append(extracted_file)
    return extracted_files