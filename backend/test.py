from vectorStoring import storing
from noPklRetrieval import create_retriever, rag

retriever = create_retriever()
vectorstore = retriever.vectorstore
file_path = "../examplepdf/Lund-PointeApts_OfferingMemorandum.pdf"
# storing(file_path, retriever, vectorstore)


# print(rag("projection of 2016 vs 2020 ", vectorstore))
# 
