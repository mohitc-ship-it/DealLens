# from vectorStoring import storing
# from noPklRetrieval import create_retriever, rag

# retriever = create_retriever("./chroma_db_compliance","compliance_collection")
# vectorstore = retriever.vectorstore
# # file_path = "../examplepdf/Lund-PointeApts_OfferingMemorandum.pdf"
# # storing(file_path, retriever, vectorstore)


# # print(rag("projection of 2016 vs 2020 ", vectorstore))
# # 
# print("below iteration")
# import os
# import glob

# # --- Path to folder ---
# folder_path = "../Kansas compliance codes"

# # --- Your processing function ---
# def process_pdf(pdf_path):
#     print(f"Processing: {pdf_path}")
#     # Add your logic here
#     # e.g., read PDF, extract text, fill data, etc.
#     storing(pdf_path, retriever, vectorstore)

# # --- Iterate over all PDFs in the folder ---
# pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))

# print("gonna parseeeee ", pdf_files)

# files_done = ['190807.pdf', '200473.pdf', '200705.pdf', '200894.pdf', '201037.pdf', '210265.pdf', '210502.pdf', '210961, AS AMENDED.pdf', '220198.pdf', '220364.pdf', '220775.pdf', '230016.pdf', '230215.pdf', '230823.pdf', '240708 (1).pdf', '240724.pdf', '240902.pdf', '250709.pdf', 'Ordinance No. 120824.pdf', 'Ordinance No. 130772.pdf', 'Ordinance No. 130792 (Committee Substitute).pdf', 'Ordinance No. 170236.pdf', 'Ordinance No. 170587.pdf', 'Ordinance No. 170593.pdf', 'Ordinance No. 170949.pdf', 'Ordinance No. 180516.pdf', 'Ordinance No. 180700.pdf', 'Ordinance No. 180890.pdf']

# # for pdf_file in pdf_files:
# #     if pdf_file in files_done:
# #         print(f"Skipping already processed file: {pdf_file}")
# #         continue
# #     print("parsing file:", pdf_file)
# #     process_pdf(pdf_file)


# files_done_set = set(f.lower().strip() for f in files_done)

# for pdf_file in pdf_files:
#     if pdf_file.lower().strip() in files_done_set:
#         print(f"Skipping already processed file: {pdf_file}")
#         continue
#     print("Parsing file:", pdf_file)
#     process_pdf(pdf_file)


from vectorStoring import storing
from noPklRetrieval import create_retriever, rag

import os
import glob
import re

# --- Create retriever & vectorstore ---
retriever = create_retriever("./chroma_db_compliance","compliance_collection")
vectorstore = retriever.vectorstore

# --- Path to PDF folder ---
folder_path = "../Kansas compliance codes"

# --- Function to normalize filenames ---
def normalize_filename(fname):
    fname = os.path.basename(fname)  # remove path
    fname = fname.lower().strip()    # lowercase + trim spaces
    fname = re.sub(r"[(),]", "", fname)   # remove commas/parentheses
    fname = re.sub(r"\s+", " ", fname)    # collapse multiple spaces
    return fname

# --- Your processing function ---
def process_pdf(pdf_path):
    print(f"Processing: {pdf_path}")
    storing(pdf_path, retriever, vectorstore)

# --- Get all PDF files in folder ---
pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))
print("Found PDF files:", pdf_files)

# --- Files already processed ---
files_done = ['190380.pdf', '190508.pdf', '190537.pdf', '190545.pdf', '190578.pdf', '190597.pdf', '190622.pdf', '190718.pdf', '190807.pdf', '190902.pdf', '190906.pdf', '190971.pdf', '191011.pdf', '191061.pdf', '200073.pdf', '200170.pdf', '200189.pdf', '200376.pdf', '200377.pdf', '200428.pdf', '200473.pdf', '200598.pdf', '200673.pdf', '200674.pdf', '200677.pdf', '200699.pdf', '200705.pdf', '200832.pdf', '200837.pdf', '200883.pdf', '200892.pdf', '200894.pdf', '200978.pdf', '201037.pdf', '210002.pdf', '210003.pdf', '210058.pdf', '210100.pdf', '210129.pdf', '210164.pdf', '210176.pdf', '210177.pdf', '210265.pdf', '210400.pdf', '210502.pdf', '210512.pdf', '210565.pdf', '210961, AS AMENDED.pdf', '210991.pdf', '211030.pdf', '211041.pdf', '211045.pdf', '211074 (1).pdf', '211092.pdf', '211094.pdf', '220011.pdf', '220017.pdf', '220197 (1).pdf', '220198.pdf', '220313.pdf', '220364.pdf', '220366.pdf', '220498.pdf', '220500.pdf', '220513.pdf', '220514.pdf', '220515.pdf', '220516.pdf', '220612.pdf', '220666.pdf', '220700.pdf', '220775.pdf', '220776.pdf', '220943.pdf', '230013.pdf', '230016.pdf', '230049.pdf', '230058.pdf', '230158.pdf', '230173.pdf', '230174.pdf', '230215.pdf', '230300.pdf', '230311.pdf', '230363.pdf', '230364.pdf', '230401.pdf', '230502.pdf', '230524 (1).pdf', '230548.pdf', '230701.pdf', '230823.pdf', '230830.pdf', '230852.pdf', '230932.pdf', '230940.pdf', '230953.pdf', '230954.pdf', '231019.pdf', '231032.pdf', '231037.pdf', '231046.pdf', '240024.pdf', '240045.pdf', '240082.pdf', '240222.pdf', '240223.pdf', '240252.pdf', '240253.pdf', '240324.pdf', '240337.pdf', '240353.pdf', '240409.pdf', '240445.pdf', '240534.pdf', '240568.pdf', '240641.pdf', '240708 (1).pdf', '240708.pdf', '240724.pdf', '240829.pdf', '240871.pdf', '240902.pdf', '240948.pdf', '241062.pdf', '241063.pdf', '241071.pdf', '241074.pdf', '24960.pdf', '250218.pdf', '250242.pdf', '250395.pdf', '250434 (1).pdf', '250434.pdf', '250437.pdf', '250483.pdf', '250491.pdf', '250496.pdf', '250637.pdf', '250709.pdf', '25075.pdf', 'Ordinance No. 110718 (Committee Substitute).pdf', 'Ordinance No. 120779 (Committee Substitute).pdf', 'Ordinance No. 120824.pdf', 'Ordinance No. 130315.pdf', 'Ordinance No. 130361.pdf', 'Ordinance No. 130460.pdf', 'Ordinance No. 130734 (Committee Substitute).pdf', 'Ordinance No. 130772.pdf', 'Ordinance No. 130792 (Committee Substitute).pdf', 'Ordinance No. 130819 (Committee Substitute).pdf', 'Ordinance No. 130845.pdf', 'Ordinance No. 130937.pdf', 'Ordinance No. 130946.pdf', 'Ordinance No. 130986.pdf', 'Ordinance No. 140057.pdf', 'Ordinance No. 140240.pdf', 'Ordinance No. 140393.pdf', 'Ordinance No. 140424 (1).pdf', 'Ordinance No. 140424.pdf', 'Ordinance No. 140443.pdf', 'Ordinance No. 140447 (Committee Substitute).pdf', 'Ordinance No. 140484.pdf', 'Ordinance No. 140497.pdf', 'Ordinance No. 140560 (Committee Substitute).pdf', 'Ordinance No. 140563 (1).pdf', 'Ordinance No. 140578.pdf', 'Ordinance No. 140592 (Committee Substittue).pdf', 'Ordinance No. 140711 (Committee Substitute).pdf', 'Ordinance No. 140797.pdf', 'Ordinance No. 140810.pdf', 'Ordinance No. 140905.pdf', 'Ordinance No. 140935 (Committee Substitute).pdf', 'Ordinance No. 140983 (Committee Substitute).pdf', 'Ordinance No. 141012 (Committee Substitute).pdf', 'Ordinance No. 141013 (Committee Substitute).pdf', 'Ordinance No. 160861.pdf', 'Ordinance No. 160938.pdf', 'Ordinance No. 160945 (Committee Substitute).pdf', 'Ordinance No. 160958 (Committee Substitute).pdf', 'Ordinance No. 160962.pdf', 'Ordinance No. 170042.pdf', 'Ordinance No. 170124.pdf', 'Ordinance No. 170152.pdf', 'Ordinance No. 170153.pdf', 'Ordinance No. 170154 (Committee Substitute).pdf', 'Ordinance No. 170178.pdf', 'Ordinance No. 170193.pdf', 'Ordinance No. 170230.pdf', 'Ordinance No. 170236.pdf', 'Ordinance No. 170391.pdf', 'Ordinance No. 170437.pdf', 'Ordinance No. 170587.pdf', 'Ordinance No. 170593.pdf', 'Ordinance No. 170596.pdf', 'Ordinance No. 170608.pdf', 'Ordinance No. 170708.pdf', 'Ordinance No. 170736.pdf', 'Ordinance No. 170802.pdf', 'Ordinance No. 170848.pdf', 'Ordinance No. 170858.pdf', 'Ordinance No. 170911.pdf', 'Ordinance No. 170949.pdf', 'Ordinance No. 180138.pdf', 'Ordinance No. 180248.pdf', 'Ordinance No. 180267.pdf', 'Ordinance No. 180500.pdf', 'Ordinance No. 180516.pdf', 'Ordinance No. 180605.pdf', 'Ordinance No. 180615.pdf', 'Ordinance No. 180700.pdf', 'Ordinance No. 180716 (1).pdf', 'Ordinance No. 180716.pdf', 'Ordinance No. 180775.pdf', 'Ordinance No. 180837.pdf', 'Ordinance No. 180844.pdf', 'Ordinance No. 180855.pdf', 'Ordinance No. 180890.pdf', 'Ordinance No. 190067.pdf', 'Ordinance No. 190106.pdf', 'Ordinance No. 190167.pdf', 'Ordinance No. 190172.pdf', 'Ordinance No. 190173.pdf', 'Ordinance No. 190174.pdf', 'Ordinance No. 190211.pdf', 'Resolution No. 140301 (Committee Substitute).pdf']
# --- Normalize done files ---
print(len(files_done))
files_done_set = set(normalize_filename(f) for f in files_done)

# --- Loop through PDFs and process only new ones ---
for pdf_file in pdf_files:
    norm_name = normalize_filename(pdf_file)
    if norm_name in files_done_set:
        print(f"Skipping already processed file: {norm_name}")
        continue
    print("Parsing file:", norm_name)
    process_pdf(pdf_file)
    # Optionally, mark as done to avoid future repeats
    files_done_set.add(norm_name)
