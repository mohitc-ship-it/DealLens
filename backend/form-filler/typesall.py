# from pypdf import PdfReader

# # Create a PdfReader object for your fillable PDF
# reader = PdfReader("ex.pdf")

# # Get a dictionary of all form fields, including text boxes, checkboxes, and radio buttons
# all_form_fields = reader.get_fields()

# # Print the field names and their corresponding values
# for field_name, field_object in all_form_fields.items():
#     print(f"Field: {field_name}, Value: {field_object}")


from pdfrw import PdfReader

pdf = PdfReader("ex.pdf")
for page in pdf.pages:
    if '/Annots' in page:
        for annot in page.Annots:
            field = annot
            print(field)
