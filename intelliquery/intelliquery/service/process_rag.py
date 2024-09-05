from dotenv import load_dotenv
from .WebsiteService import WebsiteService
from .VectorstoreService import VectorstoreService
from .FileService import FileService
import random
from dotenv import load_dotenv
load_dotenv()


def process_rag(description, template, file):
    website_service = WebsiteService()
    vectorstore_service = VectorstoreService()
    file_service = FileService("uploads")

    if not file or not description:
        return {"error": "Missing job description or document"}, 400

    try:
        filepath = file_service.save_file(file)
        clean_text_content = file_service.load_and_clean_files(filepath)
    except ValueError as e:
        return {"error": str(e)}, 400

    namespace_idx = f"upwork{random.randint(1, 100000)}"
    valid, namespace_idx = vectorstore_service.process_document(clean_text_content, namespace_idx)

    if valid:
        url, site_id = website_service.build_website(description, template, namespace_idx)
        return {"namespace_idx": namespace_idx, "url": url}, 200
    else:
        return {"error": "Error creating vectorstore"}, 400
