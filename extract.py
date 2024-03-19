import os
import gzip
import shutil

def extract_xml_files(input_folder, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for root, dirs, files in os.walk(input_folder):
        for filename in files:
            if filename.endswith('.xml.gz'):
                filepath = os.path.join(root, filename)
                with gzip.open(filepath, 'rb') as f_in:
                    # Elimina la extensión '.gz' del nombre del archivo
                    xml_filename = filename[:-3]
                    output_path = os.path.join(output_folder, xml_filename)
                    with open(output_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                print(f"Archivo '{xml_filename}' extraído.")
                
