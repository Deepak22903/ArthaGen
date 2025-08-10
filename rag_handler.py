import os
import hashlib
import logging
import asyncio
from typing import List

from dotenv import load_dotenv
from openai import AsyncOpenAI
from pinecone import Pinecone
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Models for Data Structure ---
class QueryResult(BaseModel):
    id: str
    score: float
    content: str

# --- OpenAI Service for Embeddings and Answer Generation ---
class RAG_OpenAIService:
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key, timeout=30.0, max_retries=2)
        self.system_prompt = """You are a helpful document analysis assistant. Your task is to provide accurate and detailed answers based ONLY on the context provided from the document. If the answer is not in the context, state that the information is not available in the provided document."""

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts: return []
        response = await self.client.embeddings.create(input=texts, model="text-embedding-3-small")
        return [item.embedding for item in response.data]

    async def generate_answer(self, question: str, context: str) -> str:
        if not context.strip():
            return "I couldn't find relevant information in the document to answer this question."
        try:
            completion = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": f"Context from document:\n{context}\n\nQuestion: {question}\n\nAnswer:"}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"RAG Answer generation failed: {e}")
            return "Error generating an answer from the document."

# --- Pinecone Service for Vector Search ---
class RAG_PineconeService:
    def __init__(self, api_key: str, index_name: str, openai_service: RAG_OpenAIService):
        self.pc = Pinecone(api_key=api_key)
        self.index_name = index_name
        self.openai_service = openai_service
        self.index = self.pc.Index(self.index_name)

    async def query(self, query_text: str, doc_id: str, top_k: int = 4) -> List[QueryResult]:
        query_vector = (await self.openai_service.get_embeddings([query_text]))[0]
        response = self.index.query(
            vector=query_vector,
            filter={"document_id": {"$eq": doc_id}},
            top_k=top_k,
            include_metadata=True
        )
        return [
            QueryResult(id=m['id'], score=m['score'], content=m.get('metadata', {}).get('content', ''))
            for m in response['matches']
        ]

# --- Main RAG Query Handler Class ---
class RAGQueryHandler:
    def __init__(self, openai_api_key: str, pinecone_api_key: str, pinecone_index_name: str, document_id: str):
        self.document_id = document_id
        self.openai_service = RAG_OpenAIService(api_key=openai_api_key)
        self.pinecone_service = RAG_PineconeService(
            api_key=pinecone_api_key,
            index_name=pinecone_index_name,
            openai_service=self.openai_service
        )
        logger.info(f"RAG Handler initialized for document_id: {self.document_id}")

    async def answer_from_document(self, question: str) -> str:
        retrieved_results = await self.pinecone_service.query(question, self.document_id)
        if not retrieved_results:
            return "I couldn't find specific loan eligibility information in the provided document to answer your question."
        context = "\n\n---\n\n".join([res.content for res in retrieved_results])
        return await self.openai_service.generate_answer(question, context)

# --- Helper Function to Create a Unique ID from the Document ---
def get_document_id_from_file(file_path: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at {file_path}")
    with open(file_path, "rb") as f:
        file_buffer = f.read()
    checksum = hashlib.sha256(file_buffer).hexdigest()
    return f"doc_{checksum[:16]}"

# --- Global RAG Handler Instance and Initialization ---
rag_query_handler: RAGQueryHandler = None

def initialize_rag_handler():
    """Initializes the RAG handler singleton. Returns the handler instance or None on failure."""
    global rag_query_handler
    if rag_query_handler:
        return rag_query_handler

    try:
        logger.info("Initializing RAG system for loan eligibility...")
        load_dotenv()

        openai_key = os.getenv("OPENAI_API_KEY")
        pinecone_key = os.getenv("PINECONE_API_KEY")
        pinecone_index = os.getenv("PINECONE_INDEX_NAME")
        loan_doc_path = os.getenv("LOAN_DOCUMENT_PATH")

        if not all([openai_key, pinecone_key, pinecone_index, loan_doc_path]):
            raise ValueError("Missing RAG environment variables (OPENAI_API_KEY, PINECONE_API_KEY, LOAN_DOCUMENT_PATH, PINECONE_INDEX_NAME)")

        doc_id = get_document_id_from_file(loan_doc_path)

        rag_query_handler = RAGQueryHandler(
            openai_api_key=openai_key,
            pinecone_api_key=pinecone_key,
            pinecone_index_name=pinecone_index,
            document_id=doc_id
        )
        logger.info("✅ RAG system initialized successfully.")
        return rag_query_handler
    except Exception as e:
        logger.warning(f"⚠️ RAG system initialization failed: {e}. Loan eligibility will use a fallback response.")
        rag_query_handler = None
        return None

# Initialize the handler when the module is loaded
initialize_rag_handler()