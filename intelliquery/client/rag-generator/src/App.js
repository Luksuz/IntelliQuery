import React, { useState, useEffect } from "react";
import {
  FiFile,
  FiEdit,
  FiUpload,
  FiLayers,
  FiPlayCircle,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi"; // Import icons

function TypewriterEffect({ messages }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleTyping = () => {
      const currentMessage = messages[currentMessageIndex];

      if (isDeleting) {
        // Deleting characters
        if (charIndex > 0) {
          setDisplayedText(currentMessage.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
          timeoutId = setTimeout(handleTyping, 30); // Deleting speed
        } else {
          // Move to the next message
          setIsDeleting(false);
          setCurrentMessageIndex(
            (prevIndex) => (prevIndex + 1) % messages.length
          );
          setCharIndex(0);
          timeoutId = setTimeout(handleTyping, 50);
        }
      } else {
        // Typing characters
        if (charIndex < currentMessage.length) {
          setDisplayedText(currentMessage.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
          timeoutId = setTimeout(handleTyping, 50); // Typing speed
        } else {
          // Start deleting after a pause
          timeoutId = setTimeout(() => {
            setIsDeleting(true);
            timeoutId = setTimeout(handleTyping, 30);
          }, 500); // Pause before deleting
        }
      }
    };

    timeoutId = setTimeout(handleTyping, isDeleting ? 30 : 50);

    return () => clearTimeout(timeoutId);
  }, [charIndex, isDeleting, currentMessageIndex, messages]);

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md text-center">
      <p className="text-gray-700 text-lg font-medium">{displayedText}&nbsp;</p>
    </div>
  );
}

function App() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true); // Show typewriter effect

    const formData = new FormData();
    formData.append("description", description);
    formData.append("template", selectedTemplate);
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }

    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1OTkxODY1LCJpYXQiOjE3MjU5NTg1NjUsImp0aSI6IjE1ZjhjMDRkMzdlOTRmYzRhOGNjNDQ4MTkyOGJmNTUzIiwidXNlcl9pZCI6Nn0._r8i8qoR1YNglW1poSUSfzeoVoslrKZUzTK0MsviXUM"; // Use the real token

      const response = await fetch(
        "https://europe-west6-woven-perigee-425918-q9.cloudfunctions.net/Intelliquery",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUrl(data.url);
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

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const templates = [
    ["template1", "Standard"],
    ["template2", "Dark Green"],
    ["template3", "Neutral"],
    ["template4", "Light Red"],
  ];

  const templateImages = {
    template1: "template1.png",
    template2: "template2.png",
    template3: "template3.png",
    template4: "template4.png",
  };

  const typewriterMessages = [
    "Creating your vectorstore...",
    "Preprocessing documents...",
    "Deploying the website...",
    "Still waiting...",
  ];

  const steps = [
    {
      icon: <FiEdit className="w-6 h-6" />,
      text: "Fill in the description for the app you'd like to generate.",
    },
    {
      icon: <FiUpload className="w-6 h-6" />,
      text: "Upload your documents that will be used in the app generation process.",
    },
    {
      icon: <FiLayers className="w-6 h-6" />,
      text: "Select a template from the available options.",
    },
    {
      icon: <FiPlayCircle className="w-6 h-6" />,
      text: 'Click "Generate App" to start the process. 🚀',
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      text: "⏳ Depending on the size of the uploaded document, the app will be ready in 40-50 seconds.",
    },
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      text: "✨ Your generated app URL will be displayed once it's ready. ✨",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-400 via-blue-300 to-blue-200">
      {/* Navbar */}
      <header className="w-full bg-white bg-opacity-80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img src="./images/intelliquery.png"  alt="IntelliQuery Logo"
              className="h-8 md:h-16"/>
          {/* Navigation Links */}
          <nav className="flex space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md shadow-md hover:from-purple-500 hover:to-blue-500 transition duration-300"
            >
              Home
            </a>
            <a
              href="/my-rags"
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md shadow-md hover:from-purple-500 hover:to-blue-500 transition duration-300"
            >
              My RAGs
            </a>
            <a
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md shadow-md hover:from-purple-500 hover:to-blue-500 transition duration-300"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md shadow-md hover:from-purple-500 hover:to-blue-500 transition duration-300"
            >
              Register
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex gap-8 max-w-7xl mx-auto mt-10 px-4 mb-5">
        {/* Form Section */}
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-1/2">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            RAG App Generator
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="description"
              >
                App Description
              </label>
              <textarea
                id="description"
                className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 ease-in-out"
                rows="4"
                placeholder="Describe your app..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {/* File Input Section */}
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="file"
              >
                Upload Documents
              </label>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv,.rtf,.odt,.ods,.pptx,.ppt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,application/pdf"
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0 file:text-sm file:font-medium
                 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100
                 focus:outline-none"
                  multiple
                  onChange={handleFileChange}
                />
                {/* Display selected files */}
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {Array.from(files).map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                      >
                        <div className="flex items-center">
                          <FiFile className="text-purple-600 mr-2" />{" "}
                          {/* File icon */}
                          <span className="text-gray-700">{file.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Template
              </label>
              <div className="grid grid-cols-2 gap-4">
                {templates.map(([template, displayName]) => (
                  <div
                    key={template}
                    className={`relative cursor-pointer p-4 border rounded-md transition duration-300 ease-in-out hover:shadow-md ${
                      selectedTemplate === template
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-300 bg-white"
                    }`}
                    onClick={() => handleTemplateSelection(template)}
                    onMouseEnter={() => {
                      const imgElement = document.getElementById(
                        `image-popup-${template}`
                      );
                      if (imgElement) imgElement.style.display = "block";
                    }}
                    onMouseLeave={() => {
                      const imgElement = document.getElementById(
                        `image-popup-${template}`
                      );
                      if (imgElement) imgElement.style.display = "none";
                    }}
                  >
                    <span className="text-gray-700">{displayName}</span>
                    <img
                      id={`image-popup-${template}`}
                      src={templateImages[template]}
                      alt={template}
                      className="absolute top-[-220px] left-1/2 transform -translate-x-1/2 max-w-xs w-auto h-auto object-contain hidden outline rounded-md shadow-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              {/* Button with Typewriter Effect */}
              {generating ? (
                <TypewriterEffect messages={typewriterMessages} />
              ) : (
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full flex items-center justify-center shadow-md transition duration-300 ease-in-out"
                >
                  Generate App ✨
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tutorial Section */}
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full md:w-1/2 ">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            How to Use This App:
          </h2>
          <ul className="list-none text-gray-700 space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start leading-loose">
                <div className="flex-shrink-0 text-purple-600 mt-1">
                  {step.icon}
                </div>
                <p className="ml-3 text-lg leading-loose">{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Generated URL Section */}
      {url && (
        <div className="my-10 mx-auto w-full max-w-md bg-purple-100 p-4 rounded-md text-center shadow-md">
          <p className="text-gray-800">
            Your generated app URL:{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline"
            >
              {url}
            </a>
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white bg-opacity-80 w-full py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-700">
          <p>
            Made by:{" "}
            <a
              href="https://lukamindek.com"
              className="underline font-medium text-gray-800 hover:text-purple-600"
            >
              Luka Minđek
            </a>
          </p>
          <p>
            Want a custom RAG app?{" "}
            <a
              href="mailto:lukamindjek@gmail.com"
              className="underline font-medium text-gray-800 hover:text-purple-600"
            >
              Contact me
            </a>{" "}
            or call me at{" "}
            <a
              href="tel:+3850957674099"
              className="underline font-medium text-gray-800 hover:text-purple-600"
            >
              +385 095 767 4099
            </a>
          </p>
          <p>
            Check out my work:{" "}
            <a
              href="https://lukamindek.com"
              className="underline font-medium text-gray-800 hover:text-purple-600"
            >
              lukamindek.com
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/luksuz"
              className="underline font-medium text-gray-800 hover:text-purple-600"
            >
              GitHub
            </a>{" "}
            |{" "}
            <a
              href="https://www.linkedin.com/in/luka-mindjek-a46012262/"
              className="underline font-medium text-gray-800 hover:text-purple-600"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
