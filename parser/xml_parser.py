import xmltodict
import json

def xml_to_dict(xml_filename, **kwargs):
    """
    Convert XML file to Python dictionary.
    
    Parameters:
    - xml_filename: The filename of the input XML file.
    - **kwargs: Additional keyword arguments to pass to xmltodict.parse().
    
    Returns:
    - data_dict: Python dictionary representing the XML data.
    """
    with open(xml_filename) as xml_file:
        data_dict = xmltodict.parse(xml_file.read(), **kwargs)
    
    return data_dict


def dmarc_xml_to_dict(xml_filename):
    """
    Convert DMARC XML report to Python dictionary.
    Ensures that the 'record' key is always a list.
    
    Parameters:
    - xml_filename: The filename of the input DMARC XML report.
    
    Returns:
    - dmarc_dict: Python dictionary representing the DMARC XML report data.
    """
    dmarc_dict = xml_to_dict(xml_filename, process_namespaces=True, force_list=["record"])

    return dmarc_dict

def dict_to_json(data_dict):
    """
    Convert Python dictionary to JSON string.
    
    Parameters:
    - data_dict: Python dictionary to be converted to JSON.
    
    Returns:
    - json_string: JSON string representing the input dictionary.
    """
    json_string = json.dumps(data_dict)
    return json_string
