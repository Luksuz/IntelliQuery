exports.handler = (event, context) => {
  return {
    statusCode: 200,
    body: "Hello world"
  }
}
  
  // // netlify/functions/query-rag.js
  
  // import dotenv from 'dotenv';
  // import fetch from 'node-fetch'; // Import the fetch polyfill
  // import { PineconeStore } from '@langchain/pinecone';
  // import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
  // import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
  
  // // Load environment variables from .env file
  // dotenv.config();
  
  // // Polyfill fetch if not available
  // if (!globalThis.fetch) {
  //   globalThis.fetch = fetch;
  // }
  
  // // Environment variables
  // const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
  // const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
  
  // // Initialize Pinecone client
  // const pinecone = new PineconeClient({
  //   apiKey: PINECONE_API_KEY, // Pas the API key here if required
  // });
  
  // // Define OpenAI embeddings
  // const embeddings = new OpenAIEmbeddings({
  //   model: "text-embedding-3-small",
  // });
  
  // const llm = new ChatOpenAI({
  //   model: "gpt-4o-mini", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
  //   temperature: 0,
  // });
  
  
  // export async function handler(event) {
  //   console.log(event)
  //   if (event.httpMethod !== 'POST') {
  //     return {
  //       statusCode: 405,
  //       body: JSON.stringify({ error: 'Method Not Allowed' }),
  //     };
  //   }
  
  //   const { query } = JSON.parse(event.body);
  
  //   if (!query) {
  //     return {
  //       statusCode: 400,
  //       body: JSON.stringify({ error: 'Query parameter is required' }),
  //     };
  //   }
  
  //   try {
  //     // Initialize the index and PineconeStore within the handler
  //     const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
  //     const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  //       pineconeIndex,
  //       maxConcurrency: 5,
  //     });
  
  //     // Query Pinecone for relevant documents
  //     const results = await vectorStore.similaritySearch(query, 1);
  //     console.log("results")
  //     console.log("results")
  
  //     // Prepare the context for the LLM
  //     const context = results.map(match => match.pageContent).join(' ');
  //     console.log(context)
  
  //     // Use LangChain.js to generate a response
  //     const response = await llm.invoke(
  //       `
  //       You are a helpfull assistant and you should answer the given query only with a given context,
  //       if you dont know the answer, say that you dont know.
  
  //       query: ${query}
        
  //       context: ${context}
        
  //       `
  //     );
  //     console.log({ response });
  
  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify({ answer: response.content }),
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);
  //     return {
  //       statusCode: 500,
  //       body: JSON.stringify({ error: 'Internal Server Error' }),
  //     };
  //   }
  // }