from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
import PyPDF2
import pandas as pd
import os

def ingest_text(path="../data/finance_data.txt"):
    loader = TextLoader(path, encoding="utf-8")
    return loader.load()

def ingest_pdf(path):
    docs = []
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            docs.append(page.extract_text())
    return "\n".join(docs)

def ingest_excel(path):
    df = pd.read_excel(path)
    return df.to_string()

def ingest_documents():
    print("Loading documents...")
    documents = ingest_text()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)
    print(f"{len(chunks)} chunks created")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    Chroma.from_documents(chunks, embeddings, persist_directory="../chroma_db")
    print("Documents ingested successfully!")

if __name__ == "__main__":
    ingest_documents()
