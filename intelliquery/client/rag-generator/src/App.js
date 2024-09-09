import React, { useState } from 'react';

function App() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);

    const formData = new FormData();
    formData.append('description', description);
    formData.append('template', selectedTemplate);
    formData.append('documents', file);

    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1OTA0NTMyLCJpYXQiOjE3MjU4NzEyMzIsImp0aSI6IjFhZjk0NTFiNDk4NDRlZGQ5YWY0NTNkYmI1NTQ4ZDNjIiwidXNlcl9pZCI6NX0.MQ3WEGT3kOrU3sn8-dVgug81LMU0Z9XZF3CeYqSpKmY"//e.getItem("authToken");  // Replace with your actual token retrieval method

      const response = await fetch("http://localhost:8000/generate_rag/", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,  // Add Authorization header with Bearer token
        },
        body: formData,  // Use formData to handle file uploads
      });

      if (response.ok) {
        const data = await response.json();
        setUrl(data.url);  // Assuming the response includes a URL for the generated app
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(template);
  };

  const templates = [
    ['template1', 'Standard'],
    ['template2', 'Dark green'],
    ['template3', 'Neutral'],
    ['template4', 'Light red'],
    // ['template5', "Baby blue"],
    // ['template7', 'Blue with rating'],
    // ['template8', 'Yellow-gray with rating'],
    // ['template11', 'Hello-kitty'],
    // ['template12', "Cyberpunk"],
    // ['template13', "Steampunk"],
  ];

  const templateImages = {
    template1: 'template1.png',
    template2: 'template2.png',
    template3: 'template3.png',
    template4: 'template4.png',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">IntelliQuery</h1>
          <div>
            <a
              href="mailto:lukamindjek@gmail.com"
              className="mr-4 hover:underline"
            >
              Contact Me
            </a>
            <a
              href="https://lukamindek.com"
              className="hover:underline"
            >
              lukamindek.com
            </a>
          </div>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto">
        <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-md w-full mt-8 mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">RAG App Generator</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                App Description
              </label>
              <textarea
                id="description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
                placeholder="Describe your app..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                Upload Documents
              </label>
              <input
                type="file"
                id="file"
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Template
              </label>
              <div className="grid grid-cols-2 gap-4">
                {templates.map(([template, displayName]) => (
                  <div
                    key={template}
                    className={`relative cursor-pointer p-4 border rounded ${selectedTemplate === template ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
                    onClick={() => handleTemplateSelection(template)}
                    onMouseEnter={(e) => {
                      const imgElement = document.getElementById(`image-popup-${template}`);
                      imgElement.style.display = 'block';
                    }}
                    onMouseLeave={(e) => {
                      const imgElement = document.getElementById(`image-popup-${template}`);
                      imgElement.style.display = 'none';
                    }}
                  >
                    {displayName}
                    <img
                      id={`image-popup-${template}`}
                      src={templateImages[template]}
                      alt={template}
                      className="absolute top-[-220px] left-1/2 transform -translate-x-1/2 max-w-xs w-auto h-auto object-contain hidden outline rounded"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate App'}
              </button>
            </div>
          </form>

          {/* Suggestion Box */}
          <div className="mt-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="suggestion">
              Have any suggestions?
            </label>
            <textarea
              id="suggestion"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              placeholder="Share your feedback..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
          </div>

        </div>

        {url && (
          <div className="my-10 shadow-lg mx-auto w-full max-w-md bg-blue-300 p-3 rounded-md text-center">
            <p>Your generated app URL: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{url}</a></p>
          </div>
        )}

      </div>

      <footer className="bg-blue-600 text-white p-4 w-full text-center">
        <p>
          Made by: <a href="https://www.linkedin.com/in/luka-min%C4%91ek-a46012262/" className="underline">Luka Minđek</a>
        </p>
        <p>
          Want a custom RAG app? <a href="mailto:lukamindjek@gmail.com" className="underline">Contact me</a> or call me at <a href="tel:0957674099" className="underline">095 767 4099</a>
        </p>
        <p>
          Check out my work: <a href="https://lukamindek.com" className="underline">lukamindek.com</a> | <a href="https://github.com/luksuz" className="underline">GitHub</a> | <a href="https://www.linkedin.com/in/luka-min%C4%91ek-a46012262/" className="underline">LinkedIn</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
