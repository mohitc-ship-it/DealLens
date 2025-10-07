# import json
# from pdfrw import PdfReader, PdfWriter, PdfDict, PdfName

# def extract_fields(pdf_path):
#     """
#     Extract all fields from a PDF with detailed metadata.
#     Returns a list of field dictionaries.
#     """
#     pdf = PdfReader(pdf_path)
#     fields = []

#     for page_num, page in enumerate(pdf.pages, start=1):
#         annots = page.get('/Annots')
#         if not annots:
#             continue
#         for annot in annots:
#             if not isinstance(annot, PdfDict):
#                 continue  # skip invalid entries

#             field_name = annot.get('/T')
#             if not field_name:
#                 continue  # skip if no field name

#             field = {}
#             field['name'] = str(field_name)  # safe conversion

#             # Field type
#             field_type = annot.get('/FT')
#             field['type'] = str(field_type) if field_type else 'Unknown'

#             # Tooltip
#             tooltip = annot.get('/TU')
#             if tooltip:
#                 try:
#                     # convert to string safely
#                     field['tooltip'] = str(tooltip)
#                 except Exception:
#                     field['tooltip'] = ''
#             else:
#                 field['tooltip'] = ''


#             # Flags, default 0 if missing
#             try:
#                 field['flags'] = int(annot.get('/Ff', 0))
#             except Exception:
#                 field['flags'] = 0

#             # Possible states
#             states = annot.get('/_States_')
#             if states:
#                 field['states'] = [str(s) for s in states]
#             elif field_type == '/Btn':
#                 field['states'] = ['/On', '/Off']
#             else:
#                 field['states'] = []

#             # Rect / position
#             rect = annot.get('/Rect')
#             if rect:
#                 try:
#                     field['rect'] = [float(x) for x in rect]
#                 except Exception:
#                     field['rect'] = []
#             else:
#                 field['rect'] = []

#             field['page'] = page_num
#             fields.append(field)
#     return fields


# def fill_pdf(input_pdf, output_pdf, data_dict):
#     """
#     Fill a PDF form using pdfrw.
#     data_dict: {field_name: value, ...}
#     """
#     pdf = PdfReader(input_pdf)

#     for page in pdf.pages:
#         if '/Annots' in page:
#             for annot in page.Annots:
#                 field_name = annot.get('/T')
#                 if field_name:
#                     field_name_str = field_name.to_unicode() if hasattr(field_name, 'to_unicode') else str(field_name)
#                     if field_name_str in data_dict:
#                         value = data_dict[field_name_str]

#                         # Handle checkboxes/radio buttons
#                         if annot.get('/FT') == '/Btn':
#                             # Check the box if value is truthy
#                             annot.update(PdfDict(V=PdfName('1') if value else PdfName('Off')))
#                             annot.update(PdfDict(AS=PdfName('1') if value else PdfName('Off')))
#                         else:
#                             # Text field
#                             annot.update(PdfDict(V=str(value)))

#     PdfWriter().write(output_pdf, pdf)
#     print(f"Filled PDF saved to: {output_pdf}")


# if __name__ == "__main__":
#     input_pdf = "ex.pdf"
#     output_pdf = "ex3.pdf"

#     # 1. Extract fields
#     fields = extract_fields(input_pdf)
#     with open("pdf_fields.json", "w", encoding="utf-8") as f:
#         json.dump(fields, f, indent=4)
#     print("Field metadata saved to pdf_fields.json")

#     # 2. Example of filling fields
#     # Map field names to values (AI can generate this dynamically)
#     sample_data = {
#         "AdditionalInterest_Item_LocationProducerIdentifier_B": 101,
#         "AdditionalInterest_Item_BuildingProducerIdentifier_B": 202,
#         "AdditionalInterest_Item_OtherItemDescription_B": "Special equipment",
#         "BuildingSecurity_GuardWatchmenOtherIndicator_B": True,  # Checkbox
#         "BuildingSecurity_GuardWatchmenOtherDescription_B": "Patrol main entrance every hour",
#     }

#     fill_pdf(input_pdf, output_pdf, sample_data)
import json
from pdfrw import PdfReader, PdfDict, PdfName, PdfString

def clean_pdf_string(s):
    """
    Convert pdfrw PdfString or raw string to clean Python string without parentheses.
    """
    if s is None:
        return ''
    if hasattr(s, 'to_unicode'):
        return s.to_unicode()
    s = str(s)
    if s.startswith('(') and s.endswith(')'):
        s = s[1:-1]
    return s.strip()

def extract_fields(pdf_path):
    """
    Extract all form fields with metadata from a PDF.
    Returns a list of dictionaries.
    """
    pdf = PdfReader(pdf_path)
    fields = []

    for page_num, page in enumerate(pdf.pages, start=1):
        annots = page.get('/Annots')
        if not annots:
            continue
        for annot in annots:
            if not isinstance(annot, PdfDict):
                continue  # skip invalid entries

            field_name = annot.get('/T')
            if not field_name:
                continue  # skip if no field name

            field = {}
            field['name'] = clean_pdf_string(field_name)
            field_type = annot.get('/FT')
            field['type'] = str(field_type) if field_type else 'Unknown'
            field['tooltip'] = clean_pdf_string(annot.get('/TU'))

            # Flags
            try:
                field['flags'] = int(annot.get('/Ff', 0))
            except Exception:
                field['flags'] = 0

            # Possible states (for checkboxes/radio buttons)
            states = annot.get('/_States_')
            if states:
                field['states'] = [clean_pdf_string(s) for s in states]
            elif field_type == '/Btn':
                field['states'] = ['/On', '/Off']
            else:
                field['states'] = []

            # Rect / position
            rect = annot.get('/Rect')
            if rect:
                try:
                    field['rect'] = [float(x) for x in rect]
                except Exception:
                    field['rect'] = []
            else:
                field['rect'] = []

            field['page'] = page_num
            fields.append(field)

    return fields

if __name__ == "__main__":
    input_pdf = "ex.pdf"

    # Extract fields
    fields = extract_fields(input_pdf)

    # Save to JSON
    with open("pdf_fields_clean.json", "w", encoding="utf-8") as f:
        json.dump(fields, f, indent=4)

    print("✅ Extracted fields saved to pdf_fields_clean.json")
