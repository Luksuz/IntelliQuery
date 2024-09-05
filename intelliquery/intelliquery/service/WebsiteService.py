from .WebsiteBuilder import WebsiteBuilder
from .MetadataGenerator import MetadataGenerator

class WebsiteService:
    def __init__(self):
        self.metadataGenerator = MetadataGenerator()

    def build_website(self, job_description, template, namespace_idx):
        websiteBuilder = WebsiteBuilder(job_description, namespace_idx)
        metadata = self.metadataGenerator.generate_metadata(job_description)
        websiteBuilder.replace_metadata(metadata, template)
        url, site_id = websiteBuilder.build_website()
        websiteBuilder.set_env(site_id)

        return url, site_id