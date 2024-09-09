from .WebsiteBuilder import WebsiteBuilder
from .MetadataGenerator import MetadataGenerator
import time

class WebsiteService:
    def __init__(self):
        self.metadataGenerator = MetadataGenerator()

    def build_website(self, job_description, template, namespace_idx):
        websiteBuilder = WebsiteBuilder(job_description, namespace_idx)
        metadata = self.metadataGenerator.generate_metadata(job_description)
        site_id, url = websiteBuilder.create_site()
        replacements = websiteBuilder.replace_metadata(metadata, template, "intelliquery/deploy_digest/deploy/deploy.cjs", site_id)
        websiteBuilder.run_deployment_script()
        time.sleep(3)
        #websiteBuilder.set_env(site_id, namespace_idx)
        websiteBuilder.reset_metadata(replacements)
        print(site_id)
        return url, site_id