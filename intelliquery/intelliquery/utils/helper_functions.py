import re
from langchain_community.document_loaders import (
    PyPDFLoader, TextLoader, CSVLoader, 
    UnstructuredHTMLLoader, JSONLoader, 
    UnstructuredWordDocumentLoader, 
    UnstructuredExcelLoader, UnstructuredPowerPointLoader
)

def clean_text(text):
    text = text.replace('\n', ' ').replace('\r', '').strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    return text

def get_loader(filepath, file_extension):
    loaders = {
        "pdf": PyPDFLoader,
        "txt": TextLoader,
        "csv": CSVLoader,
        "html": UnstructuredHTMLLoader,
        "json": JSONLoader,
        "docx": UnstructuredWordDocumentLoader,
        "xlsx": UnstructuredExcelLoader,
        "pptx": UnstructuredPowerPointLoader
    }
    
    loader_class = loaders.get(file_extension)
    if loader_class:
        return loader_class(filepath)
    else:
        return None
    
def determine_chunk_size(document, base_chunk_size=500, scaling_factor=0.1, min_chunk_size=300, max_chunk_size=2000):
    text_length = len(document.split())
    dynamic_chunk_size = base_chunk_size + int(scaling_factor * text_length)
    chunk_size = max(min_chunk_size, min(dynamic_chunk_size, max_chunk_size))
    
    return chunk_size, chunk_size // 10



