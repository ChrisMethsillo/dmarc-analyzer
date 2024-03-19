from xml_parser import dmarc_xml_to_dict, dict_to_json
import os
import shutil

def parse_dmarc_reports_dir(directory: str, move_files=False, parsed_dir:str=None):
    """
    Parse DMARC reports from XML files in a directory.

    Parameters:
    - directory: The directory containing DMARC XML files.
    - move_files: If True, move the files into dir/parsed_reports
    - parsed_dir: Directory where parsed files will be moved (if move_files=True).

    Returns:
    - report_list: A list of dictionaries representing the parsed DMARC reports.
    """
    report_list = []
    
    parsed_reports_dir = os.path.join(directory, 'parsed_reports') if not parsed_dir else parsed_dir

    for filename in os.listdir(directory):
        if filename.endswith('.xml'):
            xml_file = os.path.join(directory, filename)
            try:
                report_data = dmarc_xml_to_dict(xml_file)
                report_list.append(report_data)

                if move_files:
                    if not os.path.exists(parsed_reports_dir):
                        os.makedirs(parsed_reports_dir)
                    parsed_filename = os.path.join(parsed_reports_dir, filename)
                    shutil.move(xml_file, parsed_filename)
                    
            except Exception as e:
                print(f"error: {e}\nfile: {xml_file}")

    return report_list


if __name__ == "__main__":
    directory = ".dmarc"
    print(parse_dmarc_reports_dir(directory, move_files=True))
    