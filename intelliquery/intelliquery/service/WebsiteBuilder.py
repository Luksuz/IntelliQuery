import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()

class WebsiteBuilder:
    def __init__(self, job_description, namespace_idx):
        self.job_description = job_description
        self.namespace_idx = namespace_idx


    def replace_metadata(self, metadata, template):

        title = metadata.website_title
        input_label = metadata.input_label
        input_placeholder = metadata.input_placeholder

        with open(f"intelliquery/service/templates/{template}.html", "r") as file:
            html = file.read()
        
        html = html.replace("WEBSITE_TITLE", title).replace("INPUT_TITLE", input_label).replace("INPUT_PLACEHOLDER", input_placeholder)

        with open(f"intelliquery/service/templates/{template}.html", "w") as file:
            file.write(html)

        with open("intelliquery/.env", "r") as file:
            env = file.read()
        
        env = env.replace("<NAMESPACE>", self.namespace_idx)

        with open("intelliquery/.env", "w") as file:
            file.write(env)


    def build_website(self):
        os.system("zip -r zipped/website.zip client_template/ -x client_template/node_modules/*")
        
        api_token = "nfp_J5duyioivgs2WKeXwJmY89fjvriE8hJV2eeb"
        command = f"""
        curl -H "Content-Type: application/zip" \
            -H "Authorization: Bearer {api_token}" \
            --data-binary "@zipped/website.zip" \
            https://api.netlify.com/api/v1/sites
        """

        result = os.popen(command).read()
        response_json = json.loads(result)

        site_id = response_json.get("id")
        deploy_url = response_json.get("url")
        print(response_json)
                
        return deploy_url, site_id

    
    def set_env(site_id, namespace="upwork"):
        env_vars = {
            "OPENAI_API_KEY": "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",
            "PINECONE_API_KEY": "d7713071-9c81-4409-a298-66026ed152d9",
            "NAMESPACE": namespace
        }

        api_token = "nfp_J5duyioivgs2WKeXwJmY89fjvriE8hJV2eeb"

        for key, value in env_vars.items():
            try:
                response = requests.patch(
                    f"https://api.netlify.com/api/v1/accounts/ai-stories/env/{key}?site_id={site_id}",
                    headers={"Authorization": f"Bearer {api_token}", "Content-Type": "application/json"},
                    json={"value": value, "context": "production"}
                )
                
                print(response.json())
            except Exception as e:
                print(e)

