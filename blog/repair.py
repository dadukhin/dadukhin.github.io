import zipfile
import io
import xml.etree.ElementTree as ET
import os
import argparse

def repair_docx(input_file, output_file):
    """
    Repair a corrupted .docx file by removing 200-byte '20 00' sequences from local file headers.
    """
    with open(input_file, 'rb') as f:
        data = f.read()
    
    repaired_data = bytearray()
    i = 0
    while i < len(data):
        # Look for local file header signature (50 4B 03 04)
        if i + 4 <= len(data) and data[i:i+4] == b'\x50\x4B\x03\x04':
            # Copy the first 26 bytes (up to file name length)
            repaired_data.extend(data[i:i+26])
            i += 26
            # Read file name length and extra field length
            if i + 4 <= len(data):
                file_name_length = int.from_bytes(data[i:i+2], 'little')
                extra_field_length = int.from_bytes(data[i+2:i+4], 'little')
                repaired_data.extend(data[i:i+2])  # Copy file name length
                repaired_data.extend(b'\x00\x00')  # Set extra field length to 0
                i += 4
                # Copy file name
                if i + file_name_length <= len(data):
                    repaired_data.extend(data[i:i+file_name_length])
                    i += file_name_length
                    # Skip the extra field (expected to be 200 bytes of 20 00)
                    i += extra_field_length
                else:
                    raise ValueError("Invalid file name length at offset {}".format(i))
            else:
                raise ValueError("Truncated header at offset {}".format(i))
        else:
            # Copy other data (central directory, file data, etc.)
            repaired_data.append(data[i])
            i += 1
    
    # Save repaired file
    with open(output_file, 'wb') as f:
        f.write(repaired_data)

def extract_text_from_docx(docx_file):
    """
    Extract text content from word/document.xml in a .docx file.
    """
    try:
        with zipfile.ZipFile(docx_file, 'r') as z:
            with z.open('word/document.xml') as f:
                xml_content = f.read()
                tree = ET.fromstring(xml_content)
                # Define Word namespace
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                # Find all text elements
                texts = tree.findall('.//w:t', ns)
                return ' '.join(t.text for t in texts if t.text)
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Repair a corrupted .docx file and extract text content.")
    parser.add_argument("input_docx", help="Path to the input .docx file")
    parser.add_argument("--output", default="repaired.docx", help="Path to save the repaired .docx file (default: repaired.docx)")
    args = parser.parse_args()

    # Validate input file
    if not os.path.exists(args.input_docx):
        print(f"Error: Input file '{args.input_docx}' does not exist.")
        return

    # Repair the .docx file
    try:
        print(f"Repairing '{args.input_docx}' and saving to '{args.output}'...")
        repair_docx(args.input_docx, args.output)
        print(f"Repaired file saved as '{args.output}'")
    except Exception as e:
        print(f"Error during repair: {str(e)}")
        return

    # Extract text from the repaired file
    print("\nExtracting text content...")
    text = extract_text_from_docx(args.output)
    print("\nExtracted Text:")
    print(text if text else "No text could be extracted.")

if __name__ == "__main__":
    main()