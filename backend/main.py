from vectorStoring import storing
from retreivalPipe import rag, create_retriever
import pickle

retriever = create_retriever()

# storing("Lund-PointeApts_OfferingMemorandum.pdf",retriever)

mapJson,retriever = storing("test.pdf",retriever,retriever.vectorstore)
with open("summary_to_chunk.pkl", "rb") as f:
    mapJson = pickle.load(f)
# mapJson = ""
# result = rag("What was the net operating income and expenses for the property in 2016?",retriever.vectorstore,mapJson)
# result = chain.invoke("Household projections for 2020")
# print(result.content)

