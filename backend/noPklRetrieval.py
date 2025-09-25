import pickle
from base64 import b64decode
from langchain.vectorstores import Chroma
from langchain.schema import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage

import pickle
from base64 import b64decode
from langchain.vectorstores import Chroma
from langchain.schema import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
import time

# -------------------------------
# Load summary_to_chunk mapping
# -------------------------------
# with open("summary_to_chunk.pkl", "rb") as f:
#     summary_to_chunk = pickle.load(f)

# -------------------------------
# Load vectorstore
# -------------------------------
vectorstore = Chroma(
    persist_directory="./chroma_db",
    collection_name="multi_modal_rag",
    embedding_function=GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
)

# -------------------------------
# Helper: Check if a chunk is text
# -------------------------------

# -------------------------------
# RAG Retrieval Function
# -------------------------------
# def rag(query, vectorstore, summary_to_chunk, k=5, initial_threshold=0.2, min_text_chunks=1):
#     """
#     1️⃣ Try keyword search first.
#     2️⃣ Then similarity search with adjustable threshold.
#     3️⃣ Ensure at least `min_text_chunks` text chunks.
#     """
#     print(f"Query: {query}")
    
#     # -------------------------------
#     # Step 1: Keyword-based search (simple)
#     # -------------------------------
#     # keyword_text_chunks = [
#     #     chunk for chunk in summary_to_chunk.values() 
#     #     if is_text_chunk(chunk) and query.lower() in str(chunk).lower()
#     # ]
#     keyword_text_chunks = []
    
#     # -------------------------------
#     # Step 2: Similarity search
#     # -------------------------------
#     results = vectorstore.similarity_search(query, k=k)
#     print(f"Similarity search returned: {len(results)}")

#     # Map to original chunks
#     retrieved_texts = []
#     retrieved_images = []

#     for doc in results:
#         print("got keys :,",doc.metadata)
#         # chunk = summary_to_chunk.get(doc.metadata["doc_id"])
#         chunk = doc.metadata['original_content']

#         if chunk is None:
#             continue
#         if doc.metadata['type']=="text" or doc.metadata['type']=="table":
#             retrieved_texts.append(chunk)
#         else:
#             retrieved_images.append(chunk)

#     # -------------------------------
#     # Step 3: Ensure at least 1 text chunk
#     # -------------------------------
#     # Prioritize keyword matches
#     combined_texts = keyword_text_chunks + retrieved_texts
#     combined_texts = list(dict.fromkeys(combined_texts))  # deduplicate

#     if len(combined_texts) < min_text_chunks:
#         print("Not enough text chunks, lowering similarity threshold...")
#         # Retry similarity search with lower threshold
#         # Chroma does not have a direct threshold, but we can increase k
#         more_results = vectorstore.similarity_search(query, k=k*3)
#         for doc in more_results:
#             # chunk = summary_to_chunk.get(doc.metadata["doc_id"])
#             chunk = doc.metadata['original_content']
#             if chunk is None:
#                 continue
#             if doc.metadata['type']=="text" and chunk not in combined_texts:
#                 combined_texts.append(chunk)
#                 if len(combined_texts) >= min_text_chunks:
#                     break

#     print(f"Number of text chunks retrieved: {len(combined_texts)}")
#     print(f"Number of image chunks retrieved: {len(retrieved_images)}")

#     # -------------------------------
#     # Step 4: Prepare context for LLM
#     # -------------------------------
#     context_text = "\n".join([str(t) for t in combined_texts[:5]])  # limit to first 5 text chunks
#     llm_input = f"""
#     Answer the question based only on the following context, which can include text and images:
#     Context: {context_text}
#     Question: {query}
#     """

#     # -------------------------------
#     # Step 5: Call LLM
#     # -------------------------------
#     llm = ChatGoogleGenerativeAI(
#         model="gemini-2.5-flash",
#         temperature=0,
#         max_tokens=None,
#         timeout=None,
#         max_retries=2
#     )
#     response = llm.invoke(llm_input)
#     return response



# def rag(query, vectorstore, summary_to_chunk, k=5, min_text_chunks=1):
#     """
#     RAG pipeline with text and image retrieval.
#     """
#     print(f"Query: {query}")

#     # -------------------------------
#     # Step 1: Similarity search
#     # -------------------------------
#     results = vectorstore.similarity_search(query, k=k)
#     print(f"Similarity search returned: {len(results)}")

#     # -------------------------------
#     # Step 2: Map to original chunks
#     # -------------------------------
#     retrieved_texts = []
#     retrieved_images = []

#     for doc in results:
#         chunk = doc.metadata.get('original_content')
#         if chunk is None:
#             continue

#         if doc.metadata['type'] in ["text", "table"]:
#             retrieved_texts.append(chunk)
#         elif doc.metadata['type'] == "image":
#             retrieved_images.append(chunk)

#     # -------------------------------
#     # Step 3: Ensure minimum text chunks
#     # -------------------------------
#     combined_texts = list(dict.fromkeys(retrieved_texts))  # deduplicate

#     if len(combined_texts) < min_text_chunks:
#         print("Not enough text chunks, increasing k for similarity search...")
#         more_results = vectorstore.similarity_search(query, k=k*3)
#         for doc in more_results:
#             chunk = doc.metadata.get('original_content')
#             if chunk and doc.metadata['type'] in ["text", "table"] and chunk not in combined_texts:
#                 combined_texts.append(chunk)
#                 if len(combined_texts) >= min_text_chunks:
#                     break

#     print(f"Number of text chunks retrieved: {len(combined_texts)}")
#     print(f"Number of image chunks retrieved: {len(retrieved_images)}")

#     # -------------------------------
#     # Step 4: Prepare prompt for LLM
#     # -------------------------------
#     prompt_content = []

#     # Add text chunks
#     context_text = "\n".join([str(t) for t in combined_texts[:5]])  # limit to first 5 text chunks
#     prompt_content.append({"type": "text", "text": context_text})

#     # Add images as base64 URLs
#     for img_b64 in retrieved_images:
#         prompt_content.append({
#             "type": "image_url",
#             "image_url": {"url": f"data:image/png;base64,{img_b64}"}
#         })

#     # Add the query itself
#     prompt_content.append({"type": "text", "text": f"Question: {query}"})
#     # -------------------------------
#     # Step 4: Prepare messages for LLM
#     # -------------------------------
#     messages = []

#     # Add text chunks
#     context_text = "\n".join([str(t) for t in combined_texts[:5]])  # limit to first 5 text chunks
#     if context_text:
#         messages.append(HumanMessage(content=f"Context:\n{context_text}"))

#     # Add images as base64 URLs
#     for img_b64 in retrieved_images:
#         messages.append(HumanMessage(content=f"[Image data]: data:image/png;base64,{img_b64}"))

#     # Add the query itself
#     messages.append(HumanMessage(content=f"Question: {query}"))

#     # -------------------------------
#     # Step 5: Call LLM
#     # -------------------------------
#     llm = ChatGoogleGenerativeAI(
#         model="gemini-2.5-flash",
#         temperature=0,
#         max_tokens=None,
#         timeout=None,
#         max_retries=2
#     )

#     # Pass the list of HumanMessage objects directly
#     response = llm.invoke(messages)
#     return response



def rag(query, vectorstore, summary_to_chunk, k=5, min_text_chunks=1):
    """
    RAG pipeline with text and image retrieval.
    """
    print(f"Query: {query}")

    # -------------------------------
    # Step 1: Similarity search
    # -------------------------------
    results = vectorstore.similarity_search(query, k=k)
    print(f"Similarity search returned: {len(results)}")

    # -------------------------------
    # Step 2: Map to original chunks
    # -------------------------------
    retrieved_texts = []
    retrieved_images = []

    for doc in results:
        chunk = doc.metadata.get('original_content')
        if chunk is None:
            continue

        if doc.metadata['type'] in ["text", "table"]:
            retrieved_texts.append(chunk)
        elif doc.metadata['type'] == "image":
            retrieved_images.append(chunk)

    # -------------------------------
    # Step 3: Ensure minimum text chunks
    # -------------------------------
    combined_texts = list(dict.fromkeys(retrieved_texts))  # deduplicate

    if len(combined_texts) < min_text_chunks:
        print("Not enough text chunks, increasing k for similarity search...")
        more_results = vectorstore.similarity_search(query, k=k*3)
        for doc in more_results:
            chunk = doc.metadata.get('original_content')
            if chunk and doc.metadata['type'] in ["text", "table"] and chunk not in combined_texts:
                combined_texts.append(chunk)
                if len(combined_texts) >= min_text_chunks:
                    break

    print(f"Number of text chunks retrieved: {len(combined_texts)}")
    print(f"Number of image chunks retrieved: {len(retrieved_images)}")

    # -------------------------------
    # Step 4: Prepare messages for LLM
    # -------------------------------
    # Build content list
    content_list = []

    # Add text chunks
    if combined_texts:
        context_text = "\n".join([str(t) for t in combined_texts[:5]])  # or limit by tokens
        content_list.append({"type": "text", "text": f"Context:\n{context_text}"})

    # Add images
    for img_b64 in retrieved_images:
        content_list.append({"type": "image_url", "image_url": f"data:image/png;base64,{img_b64}"})

    # Add query
    content_list.append({"type": "text", "text": f"Question: {query}"})

    # Wrap in a single HumanMessage
    message_local = HumanMessage(content=content_list)
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

    try:
        response = llm.invoke([message_local])
        return response
    except Exception as e:
        print(f"LLM call failed with error: {e}")
        print("Waiting 1 minute before retrying...")
        time.sleep(60)  # wait 60 seconds
        try:
            response = llm.invoke([message_local])
            return response
        except Exception as e2:
            print(f"Second attempt failed: {e2}")
            return None  # or raise e2 if you want to propagate
    # Pass the list of HumanMessage objects directly
    # response = llm.invoke(messages)
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
# summary_to_chunk = {}
# response = rag(query, vectorstore, summary_to_chunk)
# print("\n--- LLM RESPONSE ---\n", response)