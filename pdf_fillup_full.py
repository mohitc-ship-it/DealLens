from pdfrw import PdfReader, PdfWriter, PdfName
import json

# -----------------------------
# Step 1: Extract PDF fields
# -----------------------------
def extract_pdf_fields(pdf_path, json_output):
    pdf = PdfReader(pdf_path)
    fields_dict = {}

    for page in pdf.pages:
        annotations = page.Annots
        if annotations:
            for annot in annotations:
                if annot.Subtype == PdfName('Widget') and annot.T:
                    field_name = annot.T[1:-1]  # Remove parentheses

                    # Determine field type
                    field_type = annot.FT
                    if field_type == PdfName('Btn'):  # Checkbox / Radio
                        value = True if annot.V and annot.V != PdfName('Off') else False
                        field_type_str = 'Checkbox'
                    elif field_type == PdfName('Ch'):  # Dropdown / Combo
                        value = annot.V[1:-1] if annot.V else None
                        field_type_str = 'Dropdown'
                    else:  # Text field
                        value = annot.V[1:-1] if annot.V else None
                        field_type_str = 'Text'

                    fields_dict[field_name] = {"value": value, "type": field_type_str}

    with open(json_output, "w") as f:
        json.dump(fields_dict, f, indent=4)
    print(f"PDF fields extracted to {json_output}")
    return fields_dict


# -----------------------------
# Step 2: Fill PDF from JSON
# -----------------------------
def fill_pdf_from_json(input_pdf, output_pdf, json_file):
    with open(json_file, "r") as f:
        field_values = json.load(f)

    pdf = PdfReader(input_pdf)

    for page in pdf.pages:
        annotations = page.Annots
        if annotations:
            for annot in annotations:
                if annot.Subtype == PdfName('Widget') and annot.T:
                    field_name = annot.T[1:-1]
                    if field_name in field_values and field_values[field_name]["value"] is not None:
                        field_info = field_values[field_name]
                        if field_info["type"] == "Checkbox":
                            annot.V = PdfName('Yes') if field_info["value"] else PdfName('Off')
                        elif field_info["type"] == "Dropdown":
                            annot.V = field_info["value"]
                        else:  # Text field
                            annot.V = field_info["value"]
                        annot.AP = None  # Refresh appearance

    PdfWriter().write(output_pdf, pdf)
    print(f"Filled PDF saved as '{output_pdf}'")


# -----------------------------
# Example usage
# -----------------------------
pdf_path = "ex.pdf"
json_file = "ex.json"
# filled_pdf = "ACORD_filled.pdf"

# Extract fields to JSON
extract_pdf_fields(pdf_path, json_file)

# At this point, edit `acord_fields.json` and put your values
# Then fill PDF using the JSON
# fill_pdf_from_json(pdf_path, filled_pdf, json_file)
