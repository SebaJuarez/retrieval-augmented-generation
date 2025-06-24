import os
import google.generativeai as genai
from dotenv import load_dotenv
import pdfplumber

from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding


def initialize_query_engine(folder_path="uploads"):
    load_dotenv()
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        raise RuntimeError(
            "Falta la API KEY. Agregala en un archivo .env como GEMINI_API_KEY."
        )

    genai.configure(api_key=API_KEY)
    llm = GoogleGenAI(model="gemini-1.5-pro")

    if not os.path.exists(folder_path):
        raise RuntimeError(f"No se encontró la carpeta {folder_path}")

    documents = []
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and filename.lower().endswith(".pdf"):
            texto = ""
            with pdfplumber.open(file_path) as pdf:
                for pagina in pdf.pages:
                    texto += pagina.extract_text() + "\n"
            documents.append(Document(text=texto))

    if not documents:
        raise RuntimeError(
            f"No se encontraron archivos PDF en la carpeta {folder_path}"
        )

    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
    nodes = splitter.get_nodes_from_documents(documents)

    embed_model = GoogleGenAIEmbedding(model_name="models/embedding-001")

    index = VectorStoreIndex(nodes, embed_model=embed_model)

    query_engine = index.as_query_engine(llm=llm, similarity_top_k=3)

    print("Query engine inicializado con éxito.")

    return query_engine
