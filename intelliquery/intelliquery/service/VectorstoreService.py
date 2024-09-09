import random
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from ..utils.helper_functions import determine_chunk_size

class VectorstoreService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.namespace = f"upwork{random.randint(1, 100000)}"

    def process_document(self, clean_text_content):
        vectorstore = PineconeVectorStore(index_name="neural", embedding=self.embeddings, namespace=self.namespace)
        chunk_size, chunk_overlap = determine_chunk_size(clean_text_content)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        docs = text_splitter.create_documents([clean_text_content])
        print(docs)

        vectorstore.from_documents(
            docs,
            index_name="neural",
            embedding=self.embeddings,
            namespace=self.namespace
        )
              
        return self.namespace