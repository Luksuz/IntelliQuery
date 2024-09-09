import langchain
from langchain_openai import ChatOpenAI
from typing import Optional
from langchain_core.pydantic_v1 import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class WebsiteMetadata(BaseModel):
    """Generated RAG web-app metadata."""

    website_title: str = Field(description="The title of the website")
    input_label: str = Field(description="The name of the input box")
    input_placeholder: str = Field(
        description="The placeholder for the input box"
    )

class MetadataGenerator():
    
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o").with_structured_output(WebsiteMetadata)

    def generate_metadata(self, job_description):
        result = self.llm.invoke(f"""
                                    Generate a website title, input label and input placeholder based on this prompt/job description/description:.
                                    {job_description}
                                    """)
        return result