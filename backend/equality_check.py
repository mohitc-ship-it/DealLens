# validate_mapping.py
import os
import pickle
import base64
from typing import Set, List, Dict, Any

from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

PICKLE_PATH = "summary_to_chunk.pkl"
CHROMA_DIR = "./chroma_db"
COLLECTION_NAME = "multi_modal_rag"
EMBED_MODEL = "models/gemini-embedding-001"


def safe_load_pickle(path: str) -> Dict[str, Any]:
    if not os.path.exists(path):
        print(f"[info] pickle not found at {path}. Returning empty mapping.")
        return {}
    with open(path, "rb") as f:
        return pickle.load(f)


def try_collect_chroma_ids(collection) -> (List[str], List[dict]):
    """
    Attempts to call the underlying Chroma collection .get() and return ids + metadatas.
    Returns (ids_list, metadatas_list). If not available, returns ([], []).
    """
    try:
        collection_data = collection.get()
        ids = collection_data.get("ids", []) or []
        metadatas = collection_data.get("metadatas", []) or []
        return ids, metadatas
    except Exception as e:
        print("[warning] Failed to call collection.get():", e)
        return [], []


def extract_doc_ids_from_metadatas(metadatas: List[dict]) -> Set[str]:
    ids = set()
    for md in metadatas:
        if not isinstance(md, dict):
            continue
        # common places to keep user doc id:
        #  - metadata['doc_id']
        #  - metadata.get('id') or metadata.get('source')
        for key in ("doc_id", "id", "source"):
            if key in md and isinstance(md[key], str):
                ids.add(md[key])
        # Also, if the metadata itself contains values that look like UUIDs,
        # collect them conservatively
        # (rare; used only as fallback)
        for v in md.values():
            if isinstance(v, str) and len(v) >= 8 and "-" in v:
                ids.add(v)
    return ids


def is_base64_string(s: str) -> bool:
    if not isinstance(s, str):
        return False
    try:
        # validate=True ensures non-base64 chars raise binascii.Error
        base64.b64decode(s, validate=True)
        return True
    except Exception:
        return False


def print_summary_preview(mapping: Dict[str, Any], limit: int = 50):
    print("\nPreview of chunks in summary_to_chunk.pkl:\n")
    for i, (doc_id, chunk) in enumerate(mapping.items()):
        if i >= limit:
            break
        if isinstance(chunk, str):
            if is_base64_string(chunk):
                print(f"{doc_id}: IMAGE chunk, base64 length={len(chunk)}")
            else:
                # plain string (text)
                print(f"{doc_id}: TEXT chunk (str), length={len(chunk)}")
        else:
            # objects like CompositeElement
            typ = type(chunk)
            # attempt to read page_content if present
            page_content = getattr(chunk, "page_content", None)
            if isinstance(page_content, str):
                print(f"{doc_id}: TEXT chunk (CompositeElement), page_content length={len(page_content)}")
            else:
                print(f"{doc_id}: UNKNOWN chunk type, stored as {typ}")


def main():
    # 1. load pickle
    summary_to_chunk = safe_load_pickle(PICKLE_PATH)
    print(f"Number of entries in {PICKLE_PATH}: {len(summary_to_chunk)}\n")

    # 2. load chroma (collection)
    try:
        vectorstore = Chroma(
            persist_directory=CHROMA_DIR,
            collection_name=COLLECTION_NAME,
            embedding_function=GoogleGenerativeAIEmbeddings(model=EMBED_MODEL),
        )
    except Exception as e:
        print("[error] failed to initialize Chroma vectorstore:", e)
        return

    # 3. attempt to read underlying collection ids and metadatas
    try:
        collection = vectorstore._collection  # direct handle to chroma collection
    except Exception:
        collection = None

    chroma_ids = []
    chroma_metadatas = []
    if collection is not None:
        chroma_ids, chroma_metadatas = try_collect_chroma_ids(collection)

    print(f"Number of doc_ids in vectorstore (collection.ids): {len(chroma_ids)}")
    # print small sample
    if len(chroma_ids) > 0:
        print("sample collection ids:", chroma_ids[:10])

    # 4. extract user doc_ids from metadatas (if you stored 'doc_id' in metadata)
    metadata_doc_ids = extract_doc_ids_from_metadatas(chroma_metadatas)
    print(f"Number of metadata-doc_ids found in collection metadatas: {len(metadata_doc_ids)}")
    if len(list(metadata_doc_ids)) > 0:
        print("sample metadata doc_ids:", list(metadata_doc_ids)[:10])

    # 5. Build sets for comparison
    pkl_ids = set(summary_to_chunk.keys())
    chroma_ids_set = set(chroma_ids)
    chroma_meta_ids_set = set(metadata_doc_ids)

    # Primary comparison strategy:
    # - If you stored doc_id in metadata, compare metadata_doc_ids vs pickle keys (most reliable)
    # - Otherwise compare internal collection ids vs pickle keys (less common)
    if chroma_meta_ids_set:
        missing_in_pkl = chroma_meta_ids_set - pkl_ids
        missing_in_chroma_meta = pkl_ids - chroma_meta_ids_set
        print("\nUsing metadata doc_ids for comparison (preferred):")
        print(f"Doc IDs present in collection metadatas but missing in pickle ({len(missing_in_pkl)}): {missing_in_pkl}")
        print(f"Doc IDs present in pickle but missing in collection metadatas ({len(missing_in_chroma_meta)}): {missing_in_chroma_meta}")
    else:
        missing_in_pkl = chroma_ids_set - pkl_ids
        missing_in_chroma = pkl_ids - chroma_ids_set
        print("\nNo doc_id found in metadatas. Falling back to collection internal ids for comparison:")
        print(f"Doc IDs present in vectorstore.internal_ids but missing in pickle ({len(missing_in_pkl)}): {missing_in_pkl}")
        print(f"Doc IDs present in pickle but missing in vectorstore.internal_ids ({len(missing_in_chroma)}): {missing_in_chroma}")

    # 6. Preview mapping content (type detection)
    print_summary_preview(summary_to_chunk)

    # 7. Extra diagnostics: print full metadata list length
    if chroma_metadatas:
        print("\n[diagnostic] Example metadata entries (first 5):")
        for md in chroma_metadatas[:5]:
            print(md)

    print("\nDone.")


if __name__ == "__main__":
    main()

