const dotenv = require('dotenv');
const { PineconeStore } = require('@langchain/pinecone');
const { OpenAIEmbeddings, ChatOpenAI } = require('@langchain/openai');
const { Pinecone } = require('@pinecone-database/pinecone');

// Load environment variables
dotenv.config();

// Hardcode the API key and index name as a fallback for testing purposes
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "d7713071-9c81-4409-a298-66026ed152d9";
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "neural";
const NAMESPACE = "NAMESPACE_"

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

// Define OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: OPENAI_API_KEY
});

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
  apiKey: OPENAI_API_KEY
});

// Function to log data (temporarily using console.log)
async function logToService(logMessage) {
  console.log(logMessage); // Replace with actual logging service if needed
}

exports.handler = async function (event) {
  let logs = {
    apiKey: PINECONE_API_KEY,
    indexName: PINECONE_INDEX_NAME,
    namespace: NAMESPACE
  };

  // Log API key and index name
  await logToService(`PINECONE_API_KEY: ${PINECONE_API_KEY}`);
  await logToService(`PINECONE_INDEX_NAME: ${PINECONE_INDEX_NAME}`);

  if (!PINECONE_INDEX_NAME) {
    await logToService('Pinecone index name is missing');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Pinecone index name is missing',
        logs: logs,
      }),
    };
  }

  try {
    const body = event.body;
    await logToService(`Request Body: ${body}`);

    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Empty request body',
          logs: logs,
        }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      await logToService(`Parsed Body: ${JSON.stringify(parsedBody)}`);
    } catch (parseError) {
      await logToService(`Error parsing JSON: ${parseError.message}`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Malformed JSON',
          logs: logs,
        }),
      };
    }

    const { query } = parsedBody;

    if (!query) {
      await logToService('Query parameter is missing');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Query parameter is required',
          logs: logs,
        }),
      };
    }

    // Log the query being processed
    await logToService(`Processing query: ${query}`);

    // Initialize Pinecone index and store
    const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
    await logToService('Pinecone index initialized');

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
      namespace: NAMESPACE
    });

    // Perform a similarity search using Pinecone
    const results = await vectorStore.similaritySearch(query, 3);
    const contextText = results.map(match => match.pageContent).join(' ');

    // Log the results from Pinecone
    await logToService(`Pinecone Results: ${JSON.stringify(results)}`);

    // Use LangChain.js to generate a response from OpenAI
    const response = await llm.invoke(`
      You are a helpful assistant. Answer the following query only using the given context:
      Query: ${query}
      Context: ${contextText}
    `);

    await logToService(`OpenAI Response: ${response.content}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: response.content,
        logs: logs,
      }),
    };
  } catch (error) {
    await logToService(`Error: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        logs: logs,
      }),
    };
  }
};