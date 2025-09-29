import pickle
from base64 import b64decode
from langchain_chroma import Chroma
from langchain.schema import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage

from langchain_openai import OpenAIEmbeddings

import pickle
from base64 import b64decode
from langchain.schema import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

# -------------------------------
# Load summary_to_chunk mapping
# -------------------------------
with open("summary_to_chunk.pkl", "rb") as f:
    summary_to_chunk = pickle.load(f)

# -------------------------------
# Load vectorstore
# -------------------------------
# vectorstore = Chroma(
#     persist_directory="./chroma_db",
#     collection_name="multi_modal_rag",
#     embedding_function=GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
# )
vectorstore = Chroma(
    persist_directory="./chroma_db",
    collection_name="multi_modal_rag",
    embedding_function=OpenAIEmbeddings(model="text-embedding-3-large")
)

# -------------------------------
# Helper: Check if a chunk is text
# -------------------------------
def is_text_chunk(chunk):
    if hasattr(chunk, "page_content"):
        return True
    try:
        b64decode(chunk)
        return False
    except:
        return True

# -------------------------------
# RAG Retrieval Function
# -------------------------------
def rag(query, vectorstore, summary_to_chunk, k=5, initial_threshold=0.2, min_text_chunks=1):
    """
    1️⃣ Try keyword search first.
    2️⃣ Then similarity search with adjustable threshold.
    3️⃣ Ensure at least `min_text_chunks` text chunks.
    """
    print(f"Query: {query}")
    
    # -------------------------------
    # Step 1: Keyword-based search (simple)
    # -------------------------------
    keyword_text_chunks = [
        chunk for chunk in summary_to_chunk.values() 
        if is_text_chunk(chunk) and query.lower() in str(chunk).lower()
    ]
    
    # -------------------------------
    # Step 2: Similarity search
    # -------------------------------
    results = vectorstore.similarity_search(query, k=k)
    print(f"Similarity search returned: {len(results)}")

    # Map to original chunks
    retrieved_texts = []
    retrieved_images = []

    for doc in results:
        chunk = summary_to_chunk.get(doc.metadata["doc_id"])
        if chunk is None:
            continue
        if is_text_chunk(chunk):
            retrieved_texts.append(chunk)
        else:
            retrieved_images.append(chunk)

    # -------------------------------
    # Step 3: Ensure at least 1 text chunk
    # -------------------------------
    # Prioritize keyword matches
    combined_texts = keyword_text_chunks + retrieved_texts
    combined_texts = list(dict.fromkeys(combined_texts))  # deduplicate

    if len(combined_texts) < min_text_chunks:
        print("Not enough text chunks, lowering similarity threshold...")
        # Retry similarity search with lower threshold
        # Chroma does not have a direct threshold, but we can increase k
        more_results = vectorstore.similarity_search(query, k=k*3)
        for doc in more_results:
            chunk = summary_to_chunk.get(doc.metadata["doc_id"])
            if chunk is None:
                continue
            if is_text_chunk(chunk) and chunk not in combined_texts:
                combined_texts.append(chunk)
                if len(combined_texts) >= min_text_chunks:
                    break

    print(f"Number of text chunks retrieved: {len(combined_texts)}")
    print(f"Number of image chunks retrieved: {len(retrieved_images)}")

    # -------------------------------
    # Step 4: Prepare context for LLM
    # -------------------------------
    context_text = "\n".join([str(t) for t in combined_texts[:5]])  # limit to first 5 text chunks
    llm_input = f"""
    Answer the question based only on the following context, which can include text and images:
    Context: {context_text}
    Question: {query}
    """

    # -------------------------------
    # Step 5: Call LLM
    # -------------------------------
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2
    )
    response = llm.invoke(llm_input)
    return response

# -------------------------------
# Example usage
# -------------------------------


# query = "What is the name of the company?"
# query = "projections 2020"
# query = "list details regarding year 2016"
# query = "what is there logo has"
# query ="what is gross rental income"
# query = "describe all images u have in lines each"

# response = rag(query, vectorstore, summary_to_chunk)
# print("\n--- LLM RESPONSE ---\n", response)