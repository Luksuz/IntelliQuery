import os
from werkzeug.utils import secure_filename
from ..utils.helper_functions import get_loader, clean_text
from django.conf import settings

class FileService:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(self.upload_folder, exist_ok=True)

    def save_files(self, documents):
        file_paths = []
        for document in documents:
            # Corrected print statement to show actual document details
            print(f"DOCUMENT NAME: {document.name}", flush=True)
            file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', document.name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            # Save the document file
            with open(file_path, 'wb') as destination:
                destination.write(document.read())  
            file_paths.append(file_path)

        print(f"SAVED FILE PATHS: {file_paths}", flush=True)
        return file_paths

    def load_and_clean_files(self, filepaths):
        clean_text_content = ""
        print(f"INITIAL CLEAN TEXT CONTENT: {clean_text_content}", flush=True)
        for filepath in filepaths:
            file_extension = filepath.split('.')[-1].lower()
            print(f"PROCESSING FILE: {filepath} (EXTENSION: {file_extension})", flush=True)
            loader = get_loader(filepath, file_extension)

            if loader:
                pages = loader.load()
                text = [page.page_content for page in pages]
                raw_text = " ".join(text)
                clean_text_content += clean_text(raw_text) + " "
                print(f"CLEANED TEXT SO FAR: {clean_text_content}", flush=True)
            else:
                raise ValueError("Unsupported file type")
        
        print(f"FINAL CLEAN TEXT CONTENT: {clean_text_content}", flush=True)
        return clean_text_content
