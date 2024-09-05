import os
from werkzeug.utils import secure_filename
from ..utils.helper_functions import get_loader, clean_text
from django.conf import settings


class FileService:
    def __init__(self, upload_folder):
        self.upload_folder = upload_folder
        os.makedirs(self.upload_folder, exist_ok=True)

    def save_file(self, documents):
        file_paths = []
        for document in documents:
            file_path = os.path.join(settings.MEDIA_ROOT, 'uploads', document.name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            with open(file_path, 'wb') as destination:
                destination.write(document.read())  
            file_paths.append(file_path)

        return file_paths

    def load_and_clean_files(self, filepaths):
        clean_text_content = ""
        for filepath in filepaths:
            file_extension = filepath.split('.')[-1].lower()
            loader = get_loader(filepath, file_extension)

            if loader:
                pages = loader.load()
                text = [page.page_content for page in pages]
                raw_text = " ".join(text)
                clean_text_content += clean_text(raw_text) + " "
            else:
                raise ValueError("Unsupported file type")
            
        return clean_text_content