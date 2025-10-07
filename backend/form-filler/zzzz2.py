import json
from pdfrw import PdfReader, PdfWriter, PdfDict, PdfName

def clean_pdf_string(s):
    """Convert PdfString or raw string to clean Python string without parentheses."""
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

            # Possible states (checkboxes/radio buttons)
            states = annot.get('/_States_')
            if states:
                field['states'] = [clean_pdf_string(s) for s in states]
            elif field_type == '/Btn':
                field['states'] = ['/On', '/Off']
            else:
                field['states'] = []

            # Dropdown options for /Ch
            if field_type == '/Ch':
                options = annot.get('/Opt')
                if options:
                    field['options'] = [clean_pdf_string(opt) for opt in options]
                else:
                    field['options'] = []
            else:
                field['options'] = []

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


def fill_pdf(input_pdf, output_pdf, data_dict):
    """
    Fill a PDF form using pdfrw.
    data_dict: {field_name: value, ...}
    """
    pdf = PdfReader(input_pdf)

    for page in pdf.pages:
        annots = page.get('/Annots')
        if not annots:
            continue

        for annot in annots:
            if not isinstance(annot, PdfDict):
                continue
            field_name = annot.get('/T')
            if not field_name:
                continue
            field_name_str = clean_pdf_string(field_name)

            if field_name_str in data_dict:
                value = data_dict[field_name_str]
                field_type = annot.get('/FT')

                if field_type == '/Btn':
                    # Checkbox/radio
                    annot.update(PdfDict(V=PdfName('1') if value else PdfName('Off')))
                    annot.update(PdfDict(AS=PdfName('1') if value else PdfName('Off')))
                elif field_type == '/Ch':
                    # Dropdown / choice
                    annot.update(PdfDict(V=str(value)))
                else:
                    # Text field or other
                    annot.update(PdfDict(V=str(value)))

    PdfWriter().write(output_pdf, pdf)
    print(f"✅ Filled PDF saved to: {output_pdf}")


if __name__ == "__main__":
    input_pdf = "ex.pdf"
    output_pdf = "ex4.pdf"

    # 1️⃣ Extract fields and save JSON
    fields = extract_fields(input_pdf)
    with open("pdf_fields_clean.json", "w", encoding="utf-8") as f:
        json.dump(fields, f, indent=4)
    print("✅ Field metadata saved to pdf_fields_clean.json")

    # 2️⃣ Example of filling fields
    sample_data = {
        "AdditionalInterest_Item_LocationProducerIdentifier_B": 101,
        "AdditionalInterest_Item_BuildingProducerIdentifier_B": 202,
        "AdditionalInterest_Item_OtherItemDescription_B": "Special equipment",
        "BuildingSecurity_GuardWatchmenOtherIndicator_B": True,  # Checkbox
        "BuildingSecurity_GuardWatchmenOtherDescription_B": "Patrol main entrance every hour",
        "BuildingFireProtection_Alarm_ProtectionDescription_B": "Sprinklers and chemical system",
        "BuildingFireProtection_Alarm_SprinklerPercent_B": 80,
        "BuildingFireProtection_Alarm_ManufacturerName_B": "AlarmCo Inc.",
        "Example_DropdownField_B": "Option 2"  # Dropdown example
    }

    fill_pdf(input_pdf, output_pdf, sample_data)
