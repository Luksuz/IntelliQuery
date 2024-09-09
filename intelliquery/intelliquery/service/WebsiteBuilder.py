import requests
import os
from dotenv import load_dotenv
import json
import subprocess
import requests

load_dotenv()

class WebsiteBuilder:
    def __init__(self, job_description, namespace_idx):
        self.job_description = job_description
        self.namespace_idx = namespace_idx


    def replace_metadata(self, metadata, template, cjs_filepath, cjs_site_id):
        title = metadata.website_title
        input_label = metadata.input_label
        input_placeholder = metadata.input_placeholder

        # Paths to files
        template_path = f"intelliquery/deploy_digest/deploy/dist/index.html"
        chosen_template_path = f"intelliquery/service/templates/{template}.html"
        env_path = "intelliquery/deploy_digest/deploy/.env"
        searchjs_filepath = "intelliquery/deploy_digest/deploy/netlify/functions/search/search.js"

        with open(chosen_template_path, "r") as file:
            chosen_template = file.read()

        with open(template_path, "w") as file:
            html = file.write(chosen_template)

        # Read and replace in the HTML template
        with open(template_path, "r") as file:
            html = file.read()
        
        html_replacements = {
            "WEBSITE_TITLE": title,
            "INPUT_TITLE": input_label,
            "INPUT_PLACEHOLDER": input_placeholder
        }

        for placeholder, new_value in html_replacements.items():
            html = html.replace(placeholder, new_value)

        with open(template_path, "w") as file:
            file.write(html)

        # Read and replace in the .env file
        with open(env_path, "r") as file:
            env = file.read()

        env_replacements = {
            "NAMESPACE_": self.namespace_idx
        }

        for placeholder, new_value in env_replacements.items():
            env = env.replace(placeholder, new_value)

        with open(env_path, "w") as file:
            file.write(env)

        # Read and replace in the CJS file
        with open(cjs_filepath, "r") as file:
            cjs = file.read()

        cjs_replacements = {
            "SITE_ID": cjs_site_id
        }

        for placeholder, new_value in cjs_replacements.items():
            cjs = cjs.replace(placeholder, new_value)

        with open(cjs_filepath, "w") as file:
            file.write(cjs)

        # Read and replace in the search.js file
        with open(searchjs_filepath, "r") as file:
            search = file.read()

        search_replacements = {
            "NAMESPACE_": self.namespace_idx
        }

        for placeholder, new_value in search_replacements.items():
            search = search.replace(placeholder, new_value)  # Fix the incorrect reference

        with open(searchjs_filepath, "w") as file:
            file.write(search)

        # Return the replacements made in each file
        return {
            "html": {
                "file": template_path,
                "replacements": html_replacements
            },
            "env": {
                "file": env_path,
                "replacements": env_replacements
            },
            "cjs": {
                "file": cjs_filepath,
                "replacements": cjs_replacements
            },
            "search": {
                "file": searchjs_filepath,
                "replacements": search_replacements
            }
        }

        
    def reset_metadata(self, replacement_info):
        """
        Resets the replaced metadata back to its original placeholder values.

        :param replacement_info: The dictionary containing file paths and their respective replacements
        """
        for file_type, data in replacement_info.items():
            filepath = data["file"]
            replacements = data["replacements"]

            # Read the file content
            with open(filepath, "r") as file:
                content = file.read()

            # Reverse the replacements (replace the current values with the original placeholders)
            for original, new_value in replacements.items():
                content = content.replace(new_value, original)

            # Write the updated content back to the file
            with open(filepath, "w") as file:
                file.write(content)


    def create_site(self):
        api_token = "nfp_J5duyioivgs2WKeXwJmY89fjvriE8hJV2eeb"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }

        # Define the URL for creating a site
        url = "https://api.netlify.com/api/v1/sites"

        # Send a POST request to create the site
        response = requests.post(url, headers=headers, json={})

        # Check if the request was successful
        if response.status_code == 201:
            # Parse the response JSON and extract site ID
            response_json = response.json()
            site_id = response_json['site_id']
            url = response_json["url"]
            return site_id, url
        else:
            # Handle error if the request was not successful
            print(f"Failed to create site. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None, None


    def run_deployment_script(self):
        js_file = 'deploy.cjs'
        js_directory = 'intelliquery/deploy_digest/deploy'

        # Execute the JavaScript file using Node.js within the correct directory
        command = f'cd {js_directory} && node {js_file}'
        
        try:
            # subprocess.run will wait for the command to complete
            result = subprocess.run(command, shell=True, capture_output=True, text=True, check=True)
            
            # Print standard output and standard error
            print("Script output:")
            print(result.stdout)
            
            print("Script error (if any):")
            print(result.stderr)

            return result.stdout, result.stderr

        except subprocess.CalledProcessError as e:
            # Handle any errors in the script
            print(f"Script failed with return code {e.returncode}")
            print(f"Error output: {e.stderr}")
            return None, e.stderr


    def set_env(self, site_id, namespace):
        env_vars = {
            "OPENAI_API_KEY": "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",
            "PINECONE_API_KEY": "d7713071-9c81-4409-a298-66026ed152d9",
            "PINECONE_INDEX_NAME": "neural",
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

