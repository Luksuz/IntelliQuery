from dotenv import load_dotenv
from .WebsiteService import WebsiteService
from .VectorstoreService import VectorstoreService
from .FileService import FileService
from dotenv import load_dotenv
import time
import asyncio

load_dotenv()


def process_rag(description, template, files):
    website_service = WebsiteService()
    vectorstore_service = VectorstoreService()
    file_service = FileService("uploads")

    if not files or not description:
        return {"error": "Missing job description or document"}, 400

    try:
        filepaths = file_service.save_files(files)
        clean_text_content = file_service.load_and_clean_files(filepaths)
    except Exception as e:
        return {"error": str(e)}, 400

    start = time.time()
    namespace_idx = vectorstore_service.process_document(clean_text_content)
    end = time.time()
    print(f"vectorstore execution time: {end-start}s")

    start = time.time()
    url, site_id = website_service.build_website(description, template, namespace_idx)
    end = time.time()
    print(f"Website build time: {end-start}s")


    return {"namespace_idx": namespace_idx, "url": url, "site_id": site_id}
