from pdfrw import PdfReader, PdfName
import json

def extract_fillable_fields(pdf_path, json_output):
    """
    Extract all fillable field keys and types from an editable PDF (AcroForm)
    and save them as JSON with default values.
    """
    pdf = PdfReader(pdf_path)
    fields_dict = {}

    for page in pdf.pages:
        annotations = page.Annots
        if not annotations:
            continue

        for annot in annotations:
            if annot.Subtype == PdfName('Widget') and annot.T:
                field_name = annot.T[1:-1]  # Remove parentheses
                field_type = annot.FT

                # Determine field type and default value
                if field_type == PdfName('Tx'):
                    value = annot.V[1:-1] if annot.V else None
                    type_str = "Text"
                elif field_type == PdfName('Btn'):
                    # Checkbox or Radio
                    if annot.AP:
                        value = True if annot.V and annot.V != PdfName('Off') else False
                    else:
                        value = None
                    type_str = "CheckboxOrRadio"
                elif field_type == PdfName('Ch'):
                    value = annot.V[1:-1] if annot.V else None
                    type_str = "DropdownOrList"
                else:
                    # Skip non-fillable types like signature or buttons
                    continue

                # Save in dictionary
                fields_dict[field_name] = {
                    "value": value,
                    "type": type_str
                }

    # Save to JSON
    with open(json_output, "w") as f:
        json.dump(fields_dict, f, indent=4)
    print(f"Extracted {len(fields_dict)} fillable fields to '{json_output}'")
    return fields_dict


from pdfrw import PdfReader, PdfWriter, PdfName
import json

def fill_pdf_from_json(input_pdf, output_pdf, json_file):
    """
    Fill a PDF form using values from a JSON file, keeping it editable.
    JSON structure example:
    {
        "ACORD_CurrentDate": {"value": "2025-10-06", "type": "Text"},
        "ACORD_OptionCheckbox1": {"value": true, "type": "CheckboxOrRadio"},
        "ACORD_ProgramName": {"value": "Auto Insurance", "type": "DropdownOrList"}
    }
    """
    with open(json_file, "r") as f:
        field_values = json.load(f)

    pdf = PdfReader(input_pdf)

    for page in pdf.pages:
        annotations = page.Annots
        if not annotations:
            continue

        for annot in annotations:
            if annot.Subtype == PdfName('Widget') and annot.T:
                field_name = annot.T[1:-1]
                if field_name in field_values:
                    field_info = field_values[field_name]
                    value = field_info.get("value")
                    field_type = field_info.get("type")

                    if value is None:
                        continue  # skip empty values

                    # Fill based on type
                    if field_type == "Text":
                        annot.V = str(value)
                    elif field_type == "CheckboxOrRadio":
                        annot.V = PdfName("Yes") if value else PdfName("Off")
                    elif field_type == "DropdownOrList":
                        annot.V = str(value)

                    # Refresh appearance to keep field editable
                    annot.AP = None

    PdfWriter().write(output_pdf, pdf)
    print(f"Filled PDF saved as '{output_pdf}'")



# -----------------------------
# Example usage
# -----------------------------
pdf_path = "ex.pdf"
json_file = "fillable_fields.json"

extract_fillable_fields(pdf_path, json_file)

output_pdf = "ACORD_filled.pdf"

# fill_pdf_from_json(pdf_path, output_pdf, json_file)
