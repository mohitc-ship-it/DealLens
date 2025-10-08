from chromadb import PersistentClient

# --- Connect to Chroma ---
client = PersistentClient(path="./chroma_db_compliance")

# --- Access collection ---
collection = client.get_collection(name="compliance_collection")

# --- Retrieve all metadata ---
results = collection.get(include=["metadatas"], limit=100000)
metadatas = results.get("metadatas", [])

# --- Extract filenames into array ---
filenames = []
for meta in metadatas:
    if not meta:
        continue
    for key in ["pdf_name", "filename", "source", "file_name", "file_path"]:
        if key in meta:
            filenames.append(meta[key])
            break

# --- Deduplicate ---
filenames = sorted(set(filenames))

# --- Print or return ---
print(filenames)
print(len(filenames))

# import os
# all_files = set(os.listdir("../Kansas compliance codes"))
# print(len(all_files))