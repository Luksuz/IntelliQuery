import React, { useState } from 'react';
//import "./index.css"

function App() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);  // Show spinner

    const formData = new FormData();
    formData.append('description', description);
    formData.append('template', selectedTemplate);
    formData.append('documents', file);

    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1OTkxODY1LCJpYXQiOjE3MjU5NTg1NjUsImp0aSI6IjE1ZjhjMDRkMzdlOTRmYzRhOGNjNDQ4MTkyOGJmNTUzIiwidXNlcl9pZCI6Nn0._r8i8qoR1YNglW1poSUSfzeoVoslrKZUzTK0MsviXUM"; // Use the real token

      const response = await fetch("https://europe-west6-woven-perigee-425918-q9.cloudfunctions.net/Intelliquery", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUrl(data.url);  // Set the generated URL
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setGenerating(false);  // Hide spinner
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
            <a href="mailto:lukamindjek@gmail.com" className="mr-4 hover:underline">Contact Me</a>
            <a href="https://lukamindek.com" className="hover:underline">lukamindek.com</a>
          </div>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto flex gap-4 max-w-7xl mx-auto mt-8">
        {/* Form Section */}
        <div className="relative bg-white p-8 rounded-lg shadow-xl w-1/2">
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
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Template</label>
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
              {/* Button with Spinner */}
              <button
                type="submit"
                className="bg-indigo-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                disabled={generating}
              >
                {generating && (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8 8 8 8 0 01-8-8z"></path>
                  </svg>
                )}
                {generating ? 'Processing...' : 'Generate App'}
              </button>
            </div>
          </form>
        </div>

        {/* Tutorial Section */}
        <div className="relative bg-white p-8 rounded-lg shadow-xl w-1/2">
          <h2 className="text-xl font-bold mb-4">How to Use This App:</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Fill in the description for the app you'd like to generate.</li>
            <li>Upload your documents that will be used in the app generation process.</li>
            <li>Select a template from the available options.</li>
            <li>Click "Generate App" to start the process.</li>
            <li>Your generated app URL will be displayed once it's ready.</li>
            <li>Feel free to share any suggestions or feedback in the provided field.</li>
          </ul>
        </div>
      </div>

      {url && (
        <div className="my-10 shadow-lg mx-auto w-full max-w-md bg-blue-300 p-3 rounded-md text-center">
          <p>Your generated app URL: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{url}</a></p>
        </div>
      )}

      <footer className="bg-blue-600 text-white p-4 w-full text-center">
        <p>Made by: <a href="https://www.linkedin.com/in/luka-min%C4%91ek-a46012262/" className="underline">Luka Minđek</a></p>
        <p>Want a custom RAG app? <a href="mailto:lukamindjek@gmail.com" className="underline">Contact me</a> or call me at <a href="tel:0957674099" className="underline">095 767 4099</a></p>
        <p>Check out my work: <a href="https://lukamindek.com" className="underline">lukamindek.com</a> | <a href="https://github.com/luksuz" className="underline">GitHub</a> | <a href="https://www.linkedin.com/in/luka-min%C4%91ek-a46012262/" className="underline">LinkedIn</a></p>
      </footer>
    </div>
  );
}


export default App;