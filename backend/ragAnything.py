# import os
# import json
# import asyncio
# import datetime
# from pathlib import Path
# from raganything import RAGAnything, RAGAnythingConfig
# from lightrag.llm.openai import openai_complete_if_cache, openai_embed
# from lightrag.utils import EmbeddingFunc


# # --------------------------------------------------
# # GLOBAL CONFIGURATION
# # --------------------------------------------------
# API_KEY = ""   # replace
# BASE_URL = "https://api.openai.com/v1"
# WORKING_DIR = "./rag_storage"
# OUTPUT_ROOT = "./rag_outputs"


# # --------------------------------------------------
# # RAG SETUP
# # --------------------------------------------------
# def get_rag_instance() -> RAGAnything:
#     """
#     Create and return a fully configured RAGAnything instance.
#     Includes all supported parameters and default options.
#     """
#     config = RAGAnythingConfig(
#         working_dir=WORKING_DIR,
#         parser="mineru",                    # or "docling"
#         parse_method="auto",                # auto, ocr, txt
#         enable_image_processing=True,
#         enable_table_processing=True,
#         enable_equation_processing=True,
#         enable_duplicate_check=True,
#         enable_auto_save=True,
#         enable_cache=True,
#         allow_resume_on_failure=True,
#         extract_references=True,            # ✅ Keep references extraction if supported
#         save_intermediate=True,             # ✅ Save intermediate parsing results
#     )

#     # --- LLM model function ---
#     def llm_model_func(prompt, system_prompt=None, history_messages=[], **kwargs):
#         return openai_complete_if_cache(
#             "gpt-4o-mini",
#             prompt,
#             system_prompt=system_prompt,
#             history_messages=history_messages,
#             api_key=API_KEY,
#             base_url=BASE_URL,
#             **kwargs,
#         )

#     # --- Vision model function (for multimodal inputs) ---
#     def vision_model_func(
#         prompt,
#         system_prompt=None,
#         history_messages=[],
#         image_data=None,
#         messages=None,
#         **kwargs,
#     ):
#         if messages:
#             return openai_complete_if_cache(
#                    "gpt-4o-mini",
#                 "",
#                 messages=messages,
#                 api_key=API_KEY,
#                 base_url=BASE_URL,
#                 **kwargs,
#             )
#         elif image_data:
#             return openai_complete_if_cache(
#                   "gpt-4o-mini",
#                 "",
#                 messages=[
#                     {
#                         "role": "user",
#                         "content": [
#                             {"type": "text", "text": prompt},
#                             {
#                                 "type": "image_url",
#                                 "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
#                             },
#                         ],
#                     },
#                 ],
#                 api_key=API_KEY,
#                 base_url=BASE_URL,
#                 **kwargs,
#             )
#         else:
#             return llm_model_func(prompt, system_prompt, history_messages, **kwargs)

#     # --- Embedding function ---
#     embedding_func = EmbeddingFunc(
#         embedding_dim=3072,
#         max_token_size=8192,
#         func=lambda texts: openai_embed(
#             texts,
#             model="text-embedding-3-large",
#             api_key=API_KEY,
#             base_url=BASE_URL,
#         ),
#     )

#     return RAGAnything(
#         config=config,
#         llm_model_func=llm_model_func,
#         vision_model_func=vision_model_func,
#         embedding_func=embedding_func,
#     )


#     # Structured output
# def structured_llm_func(
#     prompt,
#     structure,
#     system_prompt=None,
#     history_messages=[],
#     **kwargs,
# ):
#     """
#     Generate a structured response from the LLM according to a provided schema/structure.

#     Args:
#         prompt (str): The user prompt or question.
#         structure (dict): A Python dict defining the expected output schema.
#                           Example: {"name": "string", "age": "int"}
#         system_prompt (str, optional): Instruction-level prompt for the model.
#         history_messages (list, optional): Conversational context.
#         **kwargs: Additional parameters passed to the LLM call.

#     Returns:
#         dict: A structured JSON-like response adhering to the provided schema.
#     """
#     # Create a schema-instructed system message
#     schema_instructions = f"""
#     You are a structured data generator. 
#     Given the user's prompt, output JSON strictly following this schema:
#     {json.dumps(structure, indent=2)}

#     Do not include explanations or extra text — return valid JSON only.
#     """

#     # Merge custom system prompt if given
#     final_system_prompt = (
#         f"{system_prompt}\n\n{schema_instructions}"
#         if system_prompt
#         else schema_instructions
#     )

#     # Call the model
#     result = openai_complete_if_cache(
#         "gpt-4o-mini",
#         prompt,
#         system_prompt=final_system_prompt,
#         history_messages=history_messages,
#         api_key=API_KEY,
#         base_url=BASE_URL,
#         **kwargs,
#     )

#     # Try parsing model output to structured Python data
#     try:
#         structured_output = json.loads(result.strip())
#     except Exception:
#         structured_output = {"error": "Failed to parse JSON", "raw_output": result}

#     return structured_output



# # --------------------------------------------------
# # DYNAMIC PATH HELPERS
# # --------------------------------------------------
# def create_dynamic_output_dir(prefix: str) -> str:
#     """Create timestamped dynamic output directory."""
#     timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
#     dir_path = Path(OUTPUT_ROOT) / f"{prefix}_{timestamp}"
#     dir_path.mkdir(parents=True, exist_ok=True)
#     return str(dir_path)


# def save_json(data, path):
#     """Save a dictionary to JSON."""
#     with open(path, "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=2, ensure_ascii=False)


# def save_text(data, path):
#     """Save plain text data."""
#     with open(path, "w", encoding="utf-8") as f:
#         f.write(str(data))


# # --------------------------------------------------
# # STORAGE FUNCTION
# # --------------------------------------------------
# async def store_document(
#     file_path: str,
#     parse_method: str = "auto",
#     force_reprocess: bool = False,
#     parser: str = "mineru",
#     enable_table_processing: bool = True,
#     enable_image_processing: bool = True,
#     enable_equation_processing: bool = True,
# ):
#     """
#     Store (ingest) a document into RAG storage.
#     - Performs duplicate and existence checks.
#     - Dynamically saves all outputs.
#     - Supports force reprocessing.
#     """
#     rag = get_rag_instance()

#     if not os.path.exists(file_path):
#         print(f"❌ File not found: {file_path}")
#         return

#     file_name = os.path.basename(file_path)
#     output_dir = create_dynamic_output_dir(Path(file_name).stem)

#     # Duplicate check
#     existing_docs = rag.get_all_documents()
#     if not force_reprocess and any(file_name in d.get("file_path", "") for d in existing_docs):
#         print(f"⚠️ Document already processed: {file_name}. Skipping.")
#         return

#     try:
#         print(f"📄 Processing: {file_name}")
#         result = await rag.process_document_complete(
#             file_path=file_path,
#             output_dir=output_dir,
#             parse_method=parse_method,
#             parser=parser,
#             enable_table_processing=enable_table_processing,
#             enable_image_processing=enable_image_processing,
#             enable_equation_processing=enable_equation_processing,
#             overwrite_existing=force_reprocess,
#         )

#         # ✅ Save metadata
#         meta = {
#             "file_path": file_path,
#             "output_dir": output_dir,
#             "parser": parser,
#             "parse_method": parse_method,
#             "timestamp": datetime.datetime.now().isoformat(),
#         }
#         save_json(meta, os.path.join(output_dir, "metadata.json"))

#         # ✅ Save parsed result if any
#         if result:
#             save_json(result, os.path.join(output_dir, "parsed_result.json"))

#         print(f"✅ Document processed and saved to {output_dir}")
#         return result

#     except Exception as e:
#         print(f"❌ Error processing {file_name}: {e}")


# # --------------------------------------------------
# # QUERY FUNCTION
# # --------------------------------------------------
# async def query_rag(
#     question: str,
#     mode: str = "hybrid",
#     max_results: int = 5,
#     temperature: float = 0.2,
#     top_k: int = 3,
#     with_sources: bool = True,
# ):
#     """
#     Query the RAG knowledge base with full control of parameters.
#     Dynamically saves results to timestamped folder.
#     """
#     rag = get_rag_instance()

#     if not os.path.exists(WORKING_DIR) or not os.listdir(WORKING_DIR):
#         print("⚠️ No documents in storage. Please add documents first.")
#         return None

#     if not question.strip():
#         print("⚠️ Empty query provided.")
#         return None

#     output_dir = create_dynamic_output_dir("query")
#     try:
#         print(f"\n🔍 Query: {question}")
#         result = await rag.aquery(
#             question,
#             mode=mode,
#             max_results=max_results,
#             temperature=temperature,
#             top_k=top_k,
#             with_sources=with_sources,
#         )

#         save_json(
#             {
#                 "question": question,
#                 "mode": mode,
#                 "timestamp": datetime.datetime.now().isoformat(),
#                 "result": result,
#             },
#             os.path.join(output_dir, "query_result.json"),
#         )

#         print(f"💬 Result saved at {output_dir}")
#         print("🧠 Answer:", result)
#         return result

#     except Exception as e:
#         print(f"❌ Query error: {e}")
#         return None


# # --------------------------------------------------
# # MAIN RUNNER
# # --------------------------------------------------
# async def main(file_name):
#     # === 1️⃣ STORE (run once per file) ===
#     await store_document(
#         file_path=file_name,
#         parse_method="auto",
#         force_reprocess=False,
#         parser="mineru",
#         enable_table_processing=True,
#         enable_image_processing=True,
#         enable_equation_processing=True,
#     )

#     # === 2️⃣ QUERY (can run many times) ===
#     await query_rag("What is tenant name?")
#     await query_rag("What is the annual rent?")
#     await query_rag("Give rent schedule and step-up dates.")


# if __name__ == "__main__":
#     file_name = "Third Amendment to Lease (Olive Garden - Burbank_ IL)(48939728.14) (1).pdf"
#     asyncio.run(main(file_name))
import os
import json
import asyncio
import datetime
from pathlib import Path
from raganything import RAGAnything, RAGAnythingConfig
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc
from lightrag.lightrag import LightRAG  # <-- important import


# --------------------------------------------------
# GLOBAL CONFIGURATION
# --------------------------------------------------
API_KEY = ""
  # Add your key here
BASE_URL = "https://api.openai.com/v1"
WORKING_DIR = "./rag_storage"       # Existing vector DB folder
OUTPUT_ROOT = "./rag_outputs"


# --------------------------------------------------
# GLOBAL INSTANCE CACHE
# --------------------------------------------------
_rag_instance: RAGAnything | None = None


# --------------------------------------------------
# RAG SETUP
# --------------------------------------------------
def get_rag_instance() -> RAGAnything:
    """
    Returns globally cached RAGAnything instance and ensures LightRAG is loaded from disk.
    """
    global _rag_instance
    if _rag_instance is not None:
        return _rag_instance

    config = RAGAnythingConfig(
        working_dir=WORKING_DIR,
        parser="mineru",
        parse_method="auto",
        enable_image_processing=True,
        enable_table_processing=True,
        enable_equation_processing=False,
    )

    def llm_model_func(prompt, system_prompt=None, history_messages=[], **kwargs):
        return openai_complete_if_cache(
            "gpt-4o-mini",
            prompt,
            system_prompt=system_prompt,
            history_messages=history_messages,
            api_key=API_KEY,
            base_url=BASE_URL,
            **kwargs,
        )

    def vision_model_func(
        prompt,
        system_prompt=None,
        history_messages=[],
        image_data=None,
        messages=None,
        **kwargs,
    ):
        if messages:
            return openai_complete_if_cache(
                "gpt-4o-mini",
                "",
                messages=messages,
                api_key=API_KEY,
                base_url=BASE_URL,
                **kwargs,
            )
        elif image_data:
            return openai_complete_if_cache(
                "gpt-4o",
                "",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
                            },
                        ],
                    }
                ],
                api_key=API_KEY,
                base_url=BASE_URL,
                **kwargs,
            )
        else:
            return llm_model_func(prompt, system_prompt, history_messages, **kwargs)

    embedding_func = EmbeddingFunc(
        embedding_dim=3072,
        max_token_size=8192,
        func=lambda texts: openai_embed(
            texts,
            model="text-embedding-3-large",
            api_key=API_KEY,
            base_url=BASE_URL,
        ),
    )

    # Initialize RAGAnything
    rag = RAGAnything(
        config=config,
        llm_model_func=llm_model_func,
        vision_model_func=vision_model_func,
        embedding_func=embedding_func,
    )

    # ✅ Ensure the underlying LightRAG loads your existing DB
    try:
        rag.lightrag = LightRAG(
            working_dir=WORKING_DIR,
            embedding_func=embedding_func,
            llm_model_func=llm_model_func,
        )
        print("✅ Loaded existing LightRAG vector DB successfully.")
    except Exception as e:
        print(f"⚠️ Could not load existing LightRAG DB: {e}")

    _rag_instance = rag
    return rag


# --------------------------------------------------
# STRUCTURED OUTPUT PIPELINE
# --------------------------------------------------
async def structured_output_pipeline(base_text: str, schema: dict):
    system_prompt = f"""
    You are an expert data formatter.
    Convert the following RAG output into a structured JSON object
    that strictly follows this schema:
    {json.dumps(schema, indent=2)}

    Output valid JSON only.
    """

    result = openai_complete_if_cache(
        "gpt-4o-mini",
        base_text,
        system_prompt=system_prompt,
        api_key=API_KEY,
        base_url=BASE_URL,
        response_format={"type": "json_object"},
    )

    try:
        return json.loads(result.strip())
    except Exception:
        return {"error": "Failed to parse JSON", "raw_output": result}


# --------------------------------------------------
# HELPERS
# --------------------------------------------------
def create_dynamic_output_dir(prefix: str) -> str:
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    dir_path = Path(OUTPUT_ROOT) / f"{prefix}_{timestamp}"
    dir_path.mkdir(parents=True, exist_ok=True)
    return str(dir_path)


def save_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# --------------------------------------------------
# DOCUMENT STORAGE
# --------------------------------------------------
async def store_document(file_path: str):
    rag = get_rag_instance()
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    file_name = os.path.basename(file_path)
    output_dir = create_dynamic_output_dir(Path(file_name).stem)

    try:
        print(f"📄 Processing: {file_name}")
        result = await rag.process_document_complete(
            file_path=file_path,
            output_dir=output_dir,
        )
        print(f"✅ Stored: {file_name}")
        return result
    except Exception as e:
        print(f"❌ Error processing {file_name}: {e}")
        return None


# --------------------------------------------------
# QUERY FUNCTION
# --------------------------------------------------
async def query_rag(
    question: str,
    structured_schema: dict | None = None,
    mode: str = "hybrid",
    max_results: int = 5,
    temperature: float = 0.2,
    top_k: int = 3,
    with_sources: bool = True,
):
    rag = get_rag_instance()

    if not hasattr(rag, "lightrag") or not rag.lightrag:
        print("⚠️ No LightRAG instance found. Please process a document first.")
        return None

    if not os.path.exists(WORKING_DIR) or not os.listdir(WORKING_DIR):
        print("⚠️ No documents found in working_dir. Please process documents first.")
        return None

    if not question.strip():
        print("⚠️ Empty query provided.")
        return None

    output_dir = create_dynamic_output_dir("query")

    try:
        print(f"\n🔍 Query: {question}")
        base_result = await rag.aquery(
            question,
            mode=mode,
            top_k=top_k,
        )

        if structured_schema:
            print("🧩 Running structured output layer...")
            structured_result = await structured_output_pipeline(
                json.dumps(base_result, ensure_ascii=False),
                structured_schema,
            )
        else:
            structured_result = base_result

        save_json(
            {
                "question": question,
                "timestamp": datetime.datetime.now().isoformat(),
                "base_result": base_result,
                "structured_result": structured_result,
            },
            os.path.join(output_dir, "query_result.json"),
        )

        print(f"💬 Result saved at {output_dir}")
        return structured_result

    except Exception as e:
        print(f"❌ Query error: {e}")
        return None


# --------------------------------------------------
# MAIN EXECUTION
# --------------------------------------------------
async def main(file_name: str | None = None):
    # Uncomment if you want to add new docs
    # if file_name:
    #     await store_document(file_path=file_name)

    # await query_rag("What utilities are included in the lease?")
    await query_rag("what is date of lease made")
    pass


if __name__ == "__main__":
    file_name = None
    asyncio.run(main(file_name))
