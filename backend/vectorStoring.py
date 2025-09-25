from unstructured.partition.pdf import partition_pdf


import uuid
from langchain_chroma import Chroma

from langchain.storage import InMemoryStore
from langchain.schema.document import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.retrievers.multi_vector import MultiVectorRetriever


from summaries import summariesData, summariesImages

import getpass
import os

import pickle

# output_path = "./content/"
# file_path = output_path + 'attention.pdf'

# Get the images from the CompositeElement objects
def get_images_base64(chunks):
    images_b64 = []
    for chunk in chunks:
        if "CompositeElement" in str(type(chunk)):
            chunk_els = chunk.metadata.orig_elements
            for el in chunk_els:
                if "Image" in str(type(el)):
                    images_b64.append(el.metadata.image_base64)
    return images_b64



def chunking(file_path):
    print("chunking")
    chunks = partition_pdf(
        filename=file_path,
        infer_table_structure=True,            # extract tables
        strategy="hi_res",                     # mandatory to infer tables

        extract_image_block_types=["Image"],   # Add 'Table' to list to extract image of tables
        # image_output_dir_path=output_path,   # if None, images and tables will saved in base64

        extract_image_block_to_payload=True,   # if true, will extract base64 for API usage

        chunking_strategy="by_title",          # or 'basic'
        max_characters=10000,                  # defaults to 500
        combine_text_under_n_chars=2000,       # defaults to 0
        new_after_n_chars=6000,

        # extract_images_in_pdf=True,          # deprecated
    )

    # separate tables from texts
    tables = []
    texts = []

    for chunk in chunks:
        if "Table" in str(type(chunk)):
            tables.append(chunk)

        if "CompositeElement" in str(type((chunk))):
            texts.append(chunk)

    images = get_images_base64(chunks)
    return chunks, images


import json

# def storing(file_path,retriever,vectorstore):

#     print("will be storing")

#     chunks,images = chunking(file_path)


#     print("done chunking")

#     tables = []
#     texts = []

#     for chunk in chunks:
#         if "Table" in str(type(chunk)):
#             tables.append(chunk)

#         if "CompositeElement" in str(type((chunk))):
#             texts.append(chunk)
#     # The vectorstore to use to index the child chunks
#     # vectorstore = Chroma(persist_directory="./chroma_db",collection_name="multi_modal_rag", embedding_function=GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001"))

#     # # The storage layer for the parent documents
#     # store = InMemoryStore()
#     # id_key = "doc_id"

#     # # The retriever (empty to start)
#     # retriever = MultiVectorRetriever(
#     #     vectorstore=vectorstore,
#     #     docstore=store,
#     #     id_key=id_key,
#     # )

#     id_key = retriever.id_key
    
#     print("summarising data")
#     print("texts ",len(texts))
#     print('tables ',len(tables))
#     print("images ", len(images))
#     text_summaries, table_summaries = summariesData(texts,tables)

#     print("text summaries ", text_summaries)

#     image_summaries = summariesImages(images)

#     summary_to_chunk = {}
#     # print(image_summaries[:1])
#     # summaries linking to oroginal data
#     doc_ids = [str(uuid.uuid4()) for _ in texts]
#     summary_texts = [
#         Document(page_content=summary, metadata={id_key: doc_ids[i]}) for i, summary in enumerate(text_summaries)
#     ]
#     print("summary text arr ",summary_texts)
#     if(len(doc_ids)!=0): 
#         print("saving in vector db texts")
#         retriever.vectorstore.add_documents(summary_texts)
#         retriever.docstore.mset(list(zip(doc_ids, texts)))
#         print("saved texts")
#         summary_to_chunk.update(dict(zip(doc_ids, texts)))

#     # Add tables
#     table_ids = [str(uuid.uuid4()) for _ in tables]
#     summary_tables = [
#         Document(page_content=summary, metadata={id_key: table_ids[i]}) for i, summary in enumerate(table_summaries)
#     ]
#     if(len(table_ids)!=0):
#         retriever.vectorstore.add_documents(summary_tables)
#         retriever.docstore.mset(list(zip(table_ids, tables)))
#         summary_to_chunk.update(dict(zip(table_ids, tables)))

#     # Add image summaries
#     img_ids = [str(uuid.uuid4()) for _ in images]
#     summary_img = [
#         Document(page_content=summary, metadata={id_key: img_ids[i]}) for i, summary in enumerate(image_summaries)
#     ]
#     if(len(img_ids)!=0):
#         retriever.vectorstore.add_documents(summary_img)
#         retriever.docstore.mset(list(zip(img_ids, images)))
#         summary_to_chunk.update(dict(zip(img_ids, images)))
#     print("data added to vector db")
#     with open("summary_to_chunk.pkl", "wb") as f:
#         pickle.dump(summary_to_chunk, f)
#     return summary_to_chunk,retriever



# below one is stable working
import uuid
import pickle
from base64 import b64decode
from langchain.schema.document import Document

# def storing(file_path, retriever, vectorstore):
#     print("Will be storing data...")

#     # Step 1: Chunk the document
#     chunks, images = chunking(file_path)
#     print("Done chunking")
#     print("Total chunks:", len(chunks), "Images:", len(images))

#     # Separate chunks into texts and tables
#     texts = []
#     tables = []
#     for chunk in chunks:
#         if "Table" in str(type(chunk)):
#             tables.append(chunk)
#         elif "CompositeElement" in str(type(chunk)):
#             texts.append(chunk)

#     print("Text chunks:", len(texts), "Table chunks:", len(tables))

#     # Step 2: Generate summaries
#     text_summaries, table_summaries = summariesData(texts, tables)
#     image_summaries = summariesImages(images)
#     print("Text summaries:", text_summaries)

#     # Step 3: Initialize mapping dictionary
#     summary_to_chunk = {}
#     id_key = retriever.id_key

#     # Step 4: Add text summaries
#     for summary, chunk in zip(text_summaries, texts):
#         doc_id = str(uuid.uuid4())
#         # summary_doc = Document(page_content=summary, metadata={id_key: doc_id})
#         summary_doc = Document(page_content=summary, metadata={id_key: doc_id,'type':"text","original_content":chunk})
#         retriever.vectorstore.add_documents([summary_doc])
#         # Store original chunk as string
#         chunk_content = chunk.page_content if hasattr(chunk, "page_content") else str(chunk)
#         retriever.docstore.mset([(doc_id, chunk_content)])
#         summary_to_chunk[doc_id] = chunk_content

#     # Step 5: Add table summaries
#     for summary, table_chunk in zip(table_summaries, tables):
#         doc_id = str(uuid.uuid4())
#         # summary_doc = Document(page_content=summary, metadata={id_key: doc_id})
#         summary_doc = Document(page_content=summary, metadata={id_key: doc_id,'type':'table',"original_content":table_chunk})
#         retriever.vectorstore.add_documents([summary_doc])
#         chunk_content = table_chunk.page_content if hasattr(table_chunk, "page_content") else str(table_chunk)
#         retriever.docstore.mset([(doc_id, chunk_content)])
#         summary_to_chunk[doc_id] = chunk_content

#     # Step 6: Add image summaries
#     for summary, img_chunk in zip(image_summaries, images):
#         doc_id = str(uuid.uuid4())
#         # summary_doc = Document(page_content=summary, metadata={id_key: doc_id})
#         summary_doc = Document(page_content=summary, metadata={id_key: doc_id,'type':"image","original_content":img_chunk})
#         retriever.vectorstore.add_documents([summary_doc])
#         retriever.docstore.mset([(doc_id, img_chunk)])  # base64 string
#         summary_to_chunk[doc_id] = img_chunk

#     # Step 7: Persist mapping
#     with open("summary_to_chunk.pkl", "wb") as f:
#         pickle.dump(summary_to_chunk, f)

#     print("Data added to vector DB and mapping saved.")
#     print("Total entries in summary_to_chunk:", len(summary_to_chunk))
#     return summary_to_chunk, retriever


import uuid
import pickle
from io import BytesIO
import base64
def storing(file_path, retriever, vectorstore):
    print("Will be storing data...")

    # Step 1: Chunk the document
    chunks, images = chunking(file_path)
    print("Done chunking")
    print("Total chunks:", len(chunks), "Images:", len(images))

    # Separate chunks into texts and tables
    texts = []
    tables = []
    for chunk in chunks:
        if "Table" in str(type(chunk)):
            tables.append(chunk)
        elif "CompositeElement" in str(type(chunk)):
            texts.append(chunk)

    print("Text chunks:", len(texts), "Table chunks:", len(tables))

    # Step 2: Generate summaries
    text_summaries, table_summaries = summariesData(texts, tables)
    image_summaries = summariesImages(images)
    print("Text summaries:", text_summaries)

    # Step 3: Initialize mapping dictionary
    summary_to_chunk = {}
    id_key = retriever.id_key

    # Helper to convert images to base64
    def convert_image(img):
        if isinstance(img, str):
            return img
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

    # Step 4: Add text summaries
    for summary, chunk in zip(text_summaries, texts):
        doc_id = str(uuid.uuid4())
        chunk_content = chunk.page_content if hasattr(chunk, "page_content") else str(chunk)
        metadata = {
            id_key: doc_id,
            "type": "text",
            "original_content": chunk_content
        }
        summary_doc = Document(page_content=summary, metadata=metadata)
        retriever.vectorstore.add_documents([summary_doc])
        retriever.docstore.mset([(doc_id, {"content": chunk_content})])
        summary_to_chunk[doc_id] = chunk_content

    # Step 5: Add table summaries
    for summary, chunk in zip(table_summaries, tables):
        doc_id = str(uuid.uuid4())
        chunk_content = chunk.page_content if hasattr(chunk, "page_content") else str(chunk)
        metadata = {
            id_key: doc_id,
            "type": "table",
            "original_content": chunk_content
        }
        summary_doc = Document(page_content=summary, metadata=metadata)
        retriever.vectorstore.add_documents([summary_doc])
        retriever.docstore.mset([(doc_id, {"content": chunk_content})])
        summary_to_chunk[doc_id] = chunk_content

    # Step 6: Add image summaries
    for summary, img_chunk in zip(image_summaries, images):
        doc_id = str(uuid.uuid4())
        chunk_content = convert_image(img_chunk)
        metadata = {
            id_key: doc_id,
            "type": "image",
            "original_content": chunk_content
        }
        summary_doc = Document(page_content=summary, metadata=metadata)
        retriever.vectorstore.add_documents([summary_doc])
        retriever.docstore.mset([(doc_id, {"content": chunk_content})])
        summary_to_chunk[doc_id] = chunk_content

    # Step 7: Persist mapping
    with open("summary_to_chunk.pkl", "wb") as f:
        pickle.dump(summary_to_chunk, f)

    print("Data added to vector DB and mapping saved.")
    print("Total entries in summary_to_chunk:", len(summary_to_chunk))
    return summary_to_chunk, retriever
