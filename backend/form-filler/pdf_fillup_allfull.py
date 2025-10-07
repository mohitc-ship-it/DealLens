import pdfplumber
from pdfrw import PdfReader, PdfName
import json

def extract_fields_with_title_context(pdf_path, json_output):
    pdf_fields = PdfReader(pdf_path)
    result = {}

    with pdfplumber.open(pdf_path) as pdf_text:
        for page_num, page in enumerate(pdf_fields.pages):
            annotations = page.Annots
            if not annotations:
                continue

            # Extract all text with font size
            page_words = pdf_text.pages[page_num].extract_words(extra_attrs=['size'])
            print(page_words)
            if not page_words:
                continue

            # Compute average font size
            font_sizes = [w['size'] for w in page_words]
            # print(font_sizes)
            avg_font_size = sum(font_sizes) / len(font_sizes)
            # print("Average font size:", avg_font_size)

            # Consider words with font size > avg_font_size + threshold as headings
            threshold = 5  # you can tune this
            headings = sorted([w for w in page_words if w['size'] > avg_font_size * threshold], key=lambda x: x['top'])

            for annot in annotations:
                if annot.Subtype == PdfName('Widget') and annot.T:
                    field_name = annot.T[1:-1]
                    field_type = annot.FT
                    rect = annot.Rect
                    x0, y0, x1, y1 = [float(v) for v in rect]

                    # Determine field type
                    if field_type == PdfName('Tx'):
                        value = annot.V[1:-1] if annot.V else None
                        type_str = "Text"
                    elif field_type == PdfName('Btn'):
                        value = True if annot.V and annot.V != PdfName('Off') else False
                        type_str = "CheckboxOrRadio"
                    elif field_type == PdfName('Ch'):
                        value = annot.V[1:-1] if annot.V else None
                        type_str = "DropdownOrList"
                    else:
                        continue

                    # --- Find the nearest heading above the field ---
                    context = field_name  # default
                    candidate_headings = [h for h in headings if h['top'] < y0]
                    if candidate_headings:
                        context = candidate_headings[-1]['text']

                    result[field_name] = {
                        "value": value,
                        "type": type_str,
                        "context": context
                    }

    with open(json_output, "w") as f:
        json.dump(result, f, indent=4)
    print(f"Extracted fields with title context saved to '{json_output}'")
    return result


# Example usage
# -----------------------------
pdf_path = "ex.pdf"
json_file = "ex3.json"
filled_pdf = "ACORD_filled.pdf"

# Extract fields
extract_fields_with_title_context(pdf_path, json_file)

# After editing JSON (adding your values), fill PDF
# fill_pdf_from_json(pdf_path, filled_pdf, json_file)
