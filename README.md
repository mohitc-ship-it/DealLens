# DealLens — Multi‑Modal CRE Memorandum RAG

This repository contains DealLens: a multi‑modal Retrieval-Augmented Generation (RAG) pipeline focused on extracting structured commercial real‑estate (CRE) insights from offering memoranda (PDFs) and related media. The system ingests PDFs, chunks and summarizes text/tables/images, stores summaries in a vector store (Chroma), and serves query and report-generation APIs via a FastAPI backend.

> Note: per request, the `Kansas compliance codes/` and `temp-form-filler/` folders are intentionally ignored in this README.

## Goal

Make it easy for engineers and data scientists to pick up the project, run the pipeline locally, and extend the multimodal RAG flow to support new models, QA prompts, or report templates.

## High-level architecture

1. Upload: frontend (Next.js) or backend API accepts a PDF upload.
2. Document parsing & chunking: `backend/vectorStoring.py` uses `unstructured` to partition PDFs into text chunks, table chunks, and images (base64).
3. Summarization: `backend/summaries.py` performs chunk-level summarization for text, tables, and images using an LLM (OpenAI or Google Gemini via LangChain wrappers).
4. Vector storage: summaries are added to a Chroma vectorstore along with a lightweight mapping (`summary_to_chunk.pkl`) from summary/doc_id → original chunk content.
5. RAG retrieval: `backend/noPklRetrieval.py` / `backend/pklRetrieval.py` implement retrieval logic—combining keyword search, similarity search, and minimum text‑chunk guarantees—then call an LLM with combined context (text + images) to answer queries.
6. Report generation: `backend/reportMaker.py` orchestrates a set of section queries and structures the final JSON report (using a schema in `schema.json`).
7. API surface: `backend/app.py` exposes endpoints for uploading, chat/RAG, and report generation.

Diagram (text):

Upload → Partition & chunk (text/table/image) → Summarize chunks → Add summaries to Chroma + store mapping → RAG retrieval (similarity + keyword) → LLM (structured output) → Report JSON / Chat responses

## Tech stack

- Python 3.10+ (backend)
- FastAPI (backend HTTP API)
- LangChain (higher-level LLM/chain helpers; LangChain wrappers for Google/OpenAI)
- Chroma (local vector DB via LangChain Chroma wrapper)
- unstructured (PDF partitioning: text, tables, images)
- Pillow + pillow_avif (image conversions)
- Frontend: Next.js (TypeScript) in `frontend/` — serves UI and print route for PDF export

Key Python files (backend/):

- `app.py` — FastAPI app. Exposes endpoints:

  - `POST /upload/` — upload and store a file in `uploads/` (returns a `reportId`).
  - `POST /upload-and-generate-report/` — convenience endpoint that saves, stores chunks in vector DB and returns report JSON.
  - `POST /api/chat/{file_id}` — RAG chat endpoint. Receives JSON { message: string } and returns LLM answer.
  - `GET /report/{file_key}` — build or retrieve a generated report as JSON (stores reports under `reports/`).
  - `GET /generate-report/` — run `build_report` and persist to `final_report.json`.
- `vectorStoring.py` — document ingestion and storing pipeline:

  - `chunking(file_path)` — uses `unstructured.partition.pdf.partition_pdf` to extract chunks and images. Strategy: `hi_res`, `by_title` chunking.
  - `storing(file_path, retriever, vectorstore)` — summarizes text/tables/images (via `summaries.py`), adds summary documents to the Chroma vectorstore, and writes `summary_to_chunk.pkl` mapping doc_id → original chunk content.
- `summaries.py` — summarization helpers for text, tables, and images.

  - `summariesData(texts, tables, provider='openai')` — runs a summarization chain per chunk.
  - `summariesImages(images, provider='openai')` — converts images to base64 PNG and calls the LLM to describe them.
- `noPklRetrieval.py` and `pklRetrieval.py` — RAG retrieval implementations. They:

  - initialize or create a `MultiVectorRetriever` (Chroma + InMemoryStore populated from `summary_to_chunk.pkl`).
  - perform `similarity_search(query, k=...)` to find relevant summaries.
  - map retrieved documents back to original chunks using metadata `original_content`.
  - ensure there are at least `min_text_chunks` text chunks (by expanding k or merging with keyword matches).
  - craft a combined prompt (text chunks + images) and invoke the chosen LLM (OpenAI gpt-4o-mini or Google Gemini) with structured messages.
- `reportMaker.py` — orchestrates `SECTION_QUERIES` and calls `rag()` per section. It uses `schema.json` to request structured output for each report section and then aggregates into a final report.

Other notable files/folders:

- `schema.json` — JSON schema for report sections (used by `reportMaker` to request structured output from LLMs).
- `exampleReportJson/` — sample report JSONs (useful for local testing and expected output reference).
- `uploads/`, `reports/` — runtime folders storing uploaded files and generated report JSONs.

## Multimodal RAG process (detailed)

The project implements a multimodal RAG—meaning the retrieval-store-and-answer cycle supports both text and images extracted from PDFs.

1. Parsing & Chunking

   - `unstructured.partition.pdf.partition_pdf` is used with `strategy='hi_res'` and `chunking_strategy='by_title'` to produce chunks representing paragraphs, sections, tables, and composite elements. Images are extracted as base64 payloads.
2. Chunk-level summarization

   - Each text/table chunk is summarized using a small prompt via `summariesData`. The goal is to compress the chunk into a short, semantic summary that preserves facts useful for retrieval.
   - Images are converted to PNG base64 and summarized via `summariesImages` where the LLM describes the visual content (figure captions, maps, floorplans, charts).
3. Indexing

   - Each summary is stored in Chroma along with metadata: `doc_id`, `type` (text/table/image), and `original_content` (text or base64 image). A `summary_to_chunk.pkl` file stores a mapping from summary doc_id → original content for fallback or reconstruction.
4. Retrieval

   - On query, the backend runs a similarity search on Chroma to fetch top-k summaries.
   - Retrieved summaries are mapped back to original chunks using metadata or the pickle mapping.
   - The code ensures at least a minimum number of text chunks (e.g., 1) by expanding search k or using a simple keyword scan over `summary_to_chunk`.
5. LLM fusion (generation)

   - The RAG code builds a composite context: the top text summaries (up to 5), plus any image base64 blocks. It then constructs a chat-style message (a `HumanMessage` with a content list) where image blocks are represented differently depending on the provider:
     - For OpenAI: images are attached as `{ type: 'image', source_type: 'base64', data: <base64>, mime_type: 'image/png' }`.
     - For Gemini: images are attached as `image_url` containing a data URI: `data:image/png;base64,<base64>`.
   - The chosen LLM (OpenAI or Gemini via LangChain wrappers) is invoked. `reportMaker` often requests structured output by passing a schema for the model to follow.

Why summarize before indexing?

- Summaries reduce token usage during similarity search and provide higher-level semantic anchors for retrieval.
- Storing original large chunks as metadata still allows the system to reconstruct or show full content when needed.

## Setup & run (backend)

Prerequisites:

- Python 3.10+
- Node.js + pnpm (if running frontend)
- Environment variables for API keys (example):
  - `OPENAI_API_KEY` for OpenAI usage
  - `GOOGLE_API_KEY` / appropriate Google credentials if using Gemini/Google wrappers

Install Python requirements:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start FastAPI backend (development):

```bash
# from repo root
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Common runtime folders will be created automatically: `uploads/`, `reports/`, and `chroma_db/`.

How to ingest a PDF locally (manual test):

1. Upload via API (returns a `reportId`):

   POST multipart/form-data to `http://localhost:8000/upload/` with field `file`.
2. Generate report:

   GET `http://localhost:8000/report/{reportId}`

Or use `POST /upload-and-generate-report/` with a file to ingest and run the pipeline in one call.

RAG chat endpoint example:

POST JSON { "message": "What is the NOI?" } to `http://localhost:8000/api/chat/{reportId}`

PDF export:

`GET /export-pdf/{report_id}` attempts to render the frontend report print route and return a PDF (requires a print-friendly frontend route at `http://localhost:3000/report/{report_id}/print` and a headless browser environment).

## Setup & run (frontend)

The `frontend/` folder contains a Next.js app. To run locally:

```bash
cd frontend
pnpm install
pnpm dev
```

Default dev host is `http://localhost:3000` — the backend `app.py` expects the frontend print route to exist at `/report/{id}/print` for PDF export.

## Environment & configuration notes

- Keys must be supplied via environment variables for production safety.
- `app.py` currently instantiates Chroma with OpenAI embeddings (`text-embedding-3-large`). You can switch to Google embeddings by uncommenting the other constructor and setting proper credentials.
- `summary_to_chunk.pkl` is used as an on-disk lookup to reconstruct original content for images and large chunks. It is persisted by `vectorStoring.storing`.

## Development notes & extension points

- Replace or wrap the LLM provider by editing `noPklRetrieval.rag` or `reportMaker` to select `llm_provider` and models.
- Improve chunking rules in `vectorStoring.chunking` (switch `chunking_strategy`, `max_characters`, etc.).
- Add more robust schema validation in `reportMaker` (currently uses `schema.json` to request structured outputs; results are heuristically parsed).
- Add automated unit tests targeting:
  - `vectorStoring.chunking` parsing outputs
  - `summaries.summariesData`/`summariesImages` behaviour (mock LLM responses)
  - `noPklRetrieval.rag` logic (mock vectorstore results)

## Troubleshooting

- If Chroma similarity_search returns empty results, check that embeddings are correctly configured and that `chroma_db/` contains persisted data.
- If image summaries fail: ensure `pillow_avif` and `Pillow` are installed and AVIF images can be opened.
- If LLM calls fail, verify environment API keys and provider quotas. Add logging around `llm.invoke(...)` to capture provider errors.

## Security & privacy

- Do not commit API keys to the repo. Use environment variables or secrets manager.
- Uploaded documents are stored in `uploads/` and may contain PII. Remove or sanitize after use in production.

## File map (short)

- backend/

  - `app.py` — FastAPI endpoints and global vectorstore setup
  - `vectorStoring.py` — parsing, summarizing, storing to vector DB
  - `summaries.py` — summarization helpers
  - `noPklRetrieval.py` — primary RAG retrieval + LLM invocation
  - `pklRetrieval.py` — alternative RAG retrieval using `summary_to_chunk.pkl`
  - `reportMaker.py` — orchestrates report sections and schema-based structured output
  - `schema.json` — expected report schema
- frontend/ — Next.js application (UI + print route for PDFs)
