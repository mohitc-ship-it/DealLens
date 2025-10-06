from pypdf import PdfReader
import json
import csv

# Path to your fillable PDF
pdf_path = "ACORD-125-126-140.pdf"

# Load the PDF
reader = PdfReader(pdf_path)

# Extract all form fields (name and value)
fields = reader.get_form_text_fields()  # returns a dictionary

# Save as JSON
with open("pdf_fields.json", "w") as json_file:
    json.dump(fields, json_file, indent=4)
print("Saved fields to pdf_fields.json")

# Save as CSV
with open("pdf_fields.csv", "w", newline="") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(["Field Name", "Value"])
    for key, value in fields.items():
        writer.writerow([key, value])
print("Saved fields to pdf_fields.csv")
