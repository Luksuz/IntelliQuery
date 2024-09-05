import random
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from ..utils.helper_functions import determine_chunk_size

class VectorstoreService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = PineconeVectorStore(index_name="neural", embedding=self.embeddings, namespace="upwork")

    def process_document(self, clean_text_content, namespace_idx):
        chunk_size = determine_chunk_size(clean_text_content)
        chunk_overlap = chunk_size // 10
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        docs = text_splitter.create_documents([clean_text_content])

        valid = False
        for _ in range(10):
            try:
                self.vectorstore.from_documents(
                    docs,
                    index_name="neural",
                    embedding=self.embeddings,
                    namespace=namespace_idx
                )
                valid = True
                break
            except Exception as e:
                print(e)
                namespace_idx = f"upwork{random.randint(1, 100000)}"
        
        return valid, namespace_idx