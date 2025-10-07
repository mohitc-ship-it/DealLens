# from pdfrw import PdfReader, PdfWriter, PdfName

# # --- Paths ---
# input_pdf = "ex.pdf"     # Your fillable ACORD PDF
# json_file = "example-form-filling-context/summit.json"        # JSON with field values
# output_pdf = "ACORD_filled.pdf"      # Output filled PDF

# # --- Load JSON data ---
# import json
# with open(json_file, "r") as f:
#     field_values = json.load(f)

# # --- Read PDF ---
# pdf = PdfReader(input_pdf)

# # --- Fill form fields ---
# for page in pdf.pages:
#     annotations = page.Annots
#     if annotations:
#         for annot in annotations:
#             if annot.Subtype == PdfName('Widget') and annot.T:
#                 key = annot.T[1:-1]  # Remove parentheses
#                 if key in field_values and field_values[key] is not None:
#                     annot.V = f'{field_values[key]}'
#                     annot.AP = None  # Refresh appearance

# # --- Save filled PDF ---
# PdfWriter().write(output_pdf, pdf)
# print(f"Filled PDF saved as '{output_pdf}'")


from pdfrw import PdfReader, PdfWriter, PdfName
import json

def extract_pdf_fields(input_pdf, output_json):
    """
    Extract all fillable form fields from a PDF and save them in a JSON file
    with the format: {field_name: value}.
    """
    pdf = PdfReader(input_pdf)
    fields = {}

    for page in pdf.pages:
        annotations = page.Annots
        if annotations:
            for annot in annotations:
                if annot.Subtype == PdfName('Widget') and annot.T:
                    key = annot.T[1:-1]  # Remove parentheses
                    value = annot.V[1:-1] if annot.V else ""  # Remove parentheses if value exists
                    fields[key] = value

    with open(output_json, "w") as f:
        json.dump(fields, f, indent=4)
    
    print(f"Extracted fields saved to '{output_json}'")


def fill_pdf_fields(input_pdf, json_file, output_pdf):
    """
    Fill a PDF's form fields using a JSON file containing {field_name: value}.
    """
    with open(json_file, "r") as f:
        field_values = json.load(f)

    pdf = PdfReader(input_pdf)

    for page in pdf.pages:
        annotations = page.Annots
        if annotations:
            for annot in annotations:
                if annot.Subtype == PdfName('Widget') and annot.T:
                    key = annot.T[1:-1]  # Remove parentheses
                    if key in field_values and field_values[key] is not None:
                        annot.V = f'{field_values[key]}'
                        annot.AP = None  # Refresh appearance

    PdfWriter().write(output_pdf, pdf)
    print(f"Filled PDF saved as '{output_pdf}'")


# --- Example usage ---
input_pdf = "ex.pdf"
json_file = "prem_filled.json"
output_pdf = "prem_filled.pdf"

# Extract fields
# extract_pdf_fields(input_pdf, json_file)

# Fill PDF
fill_pdf_fields(input_pdf, json_file, output_pdf)
