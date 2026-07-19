import warnings
# warnings.filterwarnings("ignore")
from tavily import TavilyClient
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv

load_dotenv()
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def get_vectorstore():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return Chroma(
        persist_directory="../chroma_db",
        embedding_function=embeddings
    )

def get_response(user_query: str, user_id: str = "guest", chat_history: list = [], doc_text: str = ""):
    # Agar document hai toh seedha usse answer karo
    if doc_text:
        relevant = [s for s in doc_text.split(".") 
                   if any(w.lower() in s.lower() for w in user_query.lower().split())]
        if relevant:
            return " ".join(relevant[:3]).strip()
        return doc_text[:500].strip()

    # Tavily fallback
    try:
        answer = tavily_client.qna_search(query=f"India finance {user_query}")
        if answer and len(str(answer)) > 20:
            return str(answer).strip()
    except:
        pass

    # Local data fallback
    vectorstore = get_vectorstore()
    # docs = vectorstore.similarity_search(user_query, k=1)
    if docs:
        text = docs[0].page_content
        if "A:" in text:
            return text.split("A:")[-1].strip()
        return text.strip()

    return "Is sawaal ka jawab available nahi hai. Hamare team se contact karein."