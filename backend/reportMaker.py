import json
from typing import Dict, Any

# Import your rag function and vectorstore
from noPklRetrieval import rag  # adjust to your actual file/module
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from langchain.vectorstores import Chroma
import pickle

# # ===== LLM Initialization (Gemini) =====
# llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

# # ===== QUERIES for modular sections =====
# SECTION_QUERIES = {
#     "property_details": "Extract all property details (address, property_name, lot size, year built, rsf, unit_count, etc.) in JSON format.",
#     "broker_info": "Extract broker contact info, brokerage, and investment strategy in JSON format.",
#     "financial_summary": "Extract asking price, NOI, Opex, Cap Rate, IRR, rent, tax, assessed value, etc. in JSON format.",
#     "debt_financing": "Extract financing info (loan amount, term, type, WALT, lease type) in JSON format.",
#     "comparables": "Extract all comparable properties with address, price, date sold, cap rate, occupancy, rsf, lot size, etc. in JSON array format.",
#     "report_summaries": "Extract free-text summaries: property_summary, financial_summary, rent_roll_overview, tenant_information, market_overview, comparables_summary, investment_highlights, value_add_opportunities, debt_financing_summary in JSON format.",
#     "modeling_data": "Extract structured modeling data: gross_potential_rent, NOI, cap rate, opex breakdown, price per unit, price per sf, rent roll mix, occupancy history, market rent comps, value-add plan, underwriting model in JSON format."
# }

# # ===== Helper: Run RAG + LLM Structuring =====
# def extract_section(query: str, vectorstore, summary_to_chunk) -> Dict[str, Any]:
#     """Run RAG for a query, then structure response via Gemini LLM."""
#     rag_result = rag(query, vectorstore, summary_to_chunk)

#     llm_prompt = f"""
#     Structure the following extracted text into a clean JSON with only valid fields.
#     Drop empty/nulls. Ensure valid JSON output.

#     Text:
#     {rag_result}
#     """
#     structured = llm.invoke(llm_prompt)
#     try:
#         return json.loads(structured.content)
#     except Exception:
#         return {"raw_text": structured.content}  # fallback

# # ===== Main: Build Full Report =====
# def build_report(vectorstore, summary_to_chunk) -> Dict[str, Any]:
#     full_report = {}

#     for section, query in SECTION_QUERIES.items():
#         print(f"Extracting {section} ...")
#         section_data = extract_section(query, vectorstore, summary_to_chunk)
#         full_report[section] = section_data

#     return full_report




import json
import re
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI

# ===== Init Gemini =====
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)

# ===== Section Queries =====
SECTION_QUERIES = {
    "property_details": "Extract all property details (address, property_name, lot size, year built, rsf, unit_count, etc.) in JSON format.",
    "broker_info": "Extract broker contact info, brokerage, and investment strategy in JSON format.",
    "financial_summary": "Extract asking price, NOI, Opex, Cap Rate, IRR, rent, tax, assessed value, etc. in JSON format.",
    "debt_financing": "Extract financing info (loan amount, term, type, WALT, lease type) in JSON format.",
    "comparables": "Extract comparable properties with address, price, date sold, cap rate, occupancy, rsf, lot size, etc. in JSON array format.",
    "report_summaries": "Extract text summaries (property_summary, financial_summary, rent_roll_overview, tenant_information, market_overview, comparables_summary, investment_highlights, value_add_opportunities, debt_financing_summary) in JSON format.",
    "modeling_data": "Extract structured modeling data (gross_potential_rent, NOI, cap rate, opex breakdown, price per unit, price per sf, rent roll mix, occupancy history, market rent comps, value-add plan, underwriting model) in JSON format."
}

# ===== Helper: force clean JSON =====
def clean_json(raw: str) -> Dict[str, Any]:
    """Clean, strip junk, force into JSON."""
    if not raw:
        return {}

    # Strip ```json ... ```
    raw = re.sub(r"^```json", "", raw.strip(), flags=re.IGNORECASE)
    raw = re.sub(r"```$", "", raw.strip())

    # Remove "I am sorry" or filler text
    if "i am sorry" in raw.lower():
        return {}

    try:
        return json.loads(raw)
    except Exception:
        # If still not valid JSON → retry with Gemini
        print("⚠️ Falling back to Gemini for structuring...")
        struct_prompt = f"""
        The following text is messy. Extract only valid JSON, 
        drop apologies/sorry messages, drop nulls/empty.

        Text:
        {raw}
        """
        resp = llm.invoke(struct_prompt)
        try:
            return json.loads(resp.content)
        except:
            return {"raw_text": resp.content}

import time
# ===== Helper: RAG + Structuring =====
def extract_section(query: str, vectorstore, summary_to_chunk) -> Dict[str, Any]:
    rag_result = rag(query, vectorstore, summary_to_chunk)
    return clean_json(rag_result.content if hasattr(rag_result, "content") else str(rag_result))

# ===== Full Report Builder =====
def build_report(vectorstore, summary_to_chunk) -> Dict[str, Any]:
    report = {}
    for section, query in SECTION_QUERIES.items():
        print(f"🔎 Extracting {section}...")
        data = extract_section(query, vectorstore, summary_to_chunk)
        if data:  # only add non-empty
            report[section] = data
    return report

# ===== Runner =====
# if __name__ == "__main__":
#     vectorstore = None  # load yours
#     summary_to_chunk = {}
#     report = build_report(vectorstore, summary_to_chunk)

#     with open("final_report.json", "w") as f:
#         json.dump(report, f, indent=2)

#     print("✅ Clean report saved to final_report.json")

if __name__ == "__main__":
    query = "Generate a complete CRE property report"
    vectorstore = Chroma(
        persist_directory="./chroma_db",
        collection_name="multi_modal_rag",
        embedding_function=GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    )
    with open("summary_to_chunk.pkl", "rb") as f:
        summary_to_chunk = pickle.load(f)

    report = build_report(vectorstore, summary_to_chunk)

    # Save JSON output
    with open("final_report.json", "w") as f:
        json.dump(report, f, indent=2)

    print("✅ Report saved to final_report.json")

