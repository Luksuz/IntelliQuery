from langchain_openai import ChatOpenAI
from typing import Optional
from langchain_core.pydantic_v1 import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class Html(BaseModel):
    """Generated HTML."""

    html: str = Field(description="generated html")

class WebsiteGenerator():
    
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o").with_structured_output(Html)

    def generate_html(self, query, curr_template):
        template_path = f"intelliquery/service/templates/{curr_template}.html"
        with open(template_path, "r") as file:
            html = file.read()
        result = self.llm.invoke(f"""
                                You assist users in customizing their single-file HTML websites that use Tailwind CDN for styling. 
                                Users provide the current implementation, and you modify the visual aspects (such as colors, fonts, and layout) 
                                while ensuring that the core functionality, API keys, credentials, and other critical components remain intact. 
                                The response is only the updated HTML code, tailored to reflect the user's customization requests. 
                                You do not provide explanations, comments, or extra text. If a requested change might affect functionality or sensitive elements, 
                                you suggest safe alternatives, but the output remains code-only.
                    

                                user query:
                                {query}

                                current html:
                                {html}
                                """)
        return result.html
    
    def alter_existing_html(html, curr_template):
        template_path = f"intelliquery/service/templates/{curr_template}.html"

        with open(template_path, "w") as file:
            file.write(html)
