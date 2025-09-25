from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil, os, pickle, json
from langchain.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Import your functions
from vectorStoring import storing
from noPklRetrieval import rag
from reportMaker import build_report
import os
import uuid
import json
app = FastAPI(title="Multi-Modal CRE RAG API")

# -------------------------------
# Global vectorstore setup
# -------------------------------
VECTORSTORE_DIR = "./chroma_db"
COLLECTION_NAME = "multi_modal_rag"

vectorstore = Chroma(
    persist_directory=VECTORSTORE_DIR,
    collection_name=COLLECTION_NAME,
    embedding_function=GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
)

# Load existing summary mapping or create empty
if os.path.exists("summary_to_chunk.pkl"):
    with open("summary_to_chunk.pkl", "rb") as f:
        summary_to_chunk = pickle.load(f)
else:
    summary_to_chunk = {}

# -------------------------------
# Endpoint 1: Upload and store new file
# -------------------------------
# @app.post("/upload-file/")
# async def upload_file(file: UploadFile = File(...)):
#     try:
#         # Save uploaded file locally
#         save_path = os.path.join("./uploads", file.filename)
#         os.makedirs("./uploads", exist_ok=True)
#         with open(save_path, "wb") as f:
#             shutil.copyfileobj(file.file, f)

#         # Call storing to add new source
#         updated_mapping, _ = storing(save_path, vectorstore, vectorstore)
        
#         # Update global mapping
#         summary_to_chunk.update(updated_mapping)

#         # Persist mapping
#         with open("summary_to_chunk.pkl", "wb") as f:
#             pickle.dump(summary_to_chunk, f)

#         return {"status": "success", "message": f"File {file.filename} stored and processed."}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


UPLOAD_DIR = "uploads"
REPORT_DIR = "reports"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)


# ---------------------------
# 1️⃣ Upload API
# ---------------------------
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        print("got file")
        # Generate unique key
        file_key = str(uuid.uuid4())
        print("id saved")
        file_path = os.path.join(UPLOAD_DIR, f"{file_key}_{file.filename}")

        # Save uploaded file
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        print("returnong response with id ", file_key)

        return JSONResponse(content={"status": "success", "reportId": file_key})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")


# ---------------------------
# 2️⃣ Report API
# ---------------------------
@app.get("/report/{file_key}")
async def generate_report(file_key: str):
    try:
        print("got file key ", file_key)
        # Check if uploaded file exists
        matching_files = [
            f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_key)
        ]
        if not matching_files:
            raise HTTPException(status_code=404, detail="File not found")

        file_path = os.path.join(UPLOAD_DIR, matching_files[0])

        # -------------------------
        # 🔹 Here call your pipeline:
        report = build_report(vectorstore, summary_to_chunk)
        # -------------------------
        # For demo, we’ll return dummy data
        report = {
            "file": matching_files[0],
            "report": f"Generated report for {matching_files[0]}"
        }

        # with open("final_report_next.json","r",encoding="utf-8") as f:
        #     report = json.load(f)

        # Save report JSON
        report_path = os.path.join(REPORT_DIR, f"{file_key}_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        return JSONResponse(content={"status": "success", "report": report})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {e}")


# -------------------------------
# Endpoint 2: Query RAG
# -------------------------------
@app.post("/query/")
async def query_rag(query: str):
    try:
        response = rag(query, vectorstore, summary_to_chunk)
        return {"query": query, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Endpoint 3: Generate report
# -------------------------------
@app.get("/generate-report/")
async def generate_report():
    try:
        report = build_report(vectorstore, summary_to_chunk)

        # Save JSON output
        with open("final_report.json", "w") as f:
            json.dump(report, f, indent=2)

        return JSONResponse(content={"status": "success", "report": report})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Endpoint: Upload PDF and generate report
# -------------------------------
@app.post("/upload-and-generate-report/")
async def upload_and_generate_report(file: UploadFile = File(...)):
    try:
        print("got request now saving")
        # # Step 1: Save uploaded file
        save_path = os.path.join("./uploads", file.filename)
        os.makedirs("./uploads", exist_ok=True)
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # # Step 2: Store chunks in vectorstore
        # updated_mapping, _ = storing(save_path, vectorstore, vectorstore)
        # summary_to_chunk.update(updated_mapping)

        # # Persist mapping
        # with open("summary_to_chunk.pkl", "wb") as f:
        #     pickle.dump(summary_to_chunk, f)

        # # Step 3: Build report
        # report = build_report(vectorstore, summary_to_chunk)

        # Optionally, save JSON output
        print("loading statc")
        # with open("backend/final_report.json", "w") as f:
        #     json.dump(report, f, indent=2)
        import json

        # Assuming 'report' is a Python dictionary or list
        try:
            with open("final_report_next.json","r",encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print("Error dumping report:", e)

        print("File has been reat.")

        return JSONResponse(content={"status": "success", "report":data})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
