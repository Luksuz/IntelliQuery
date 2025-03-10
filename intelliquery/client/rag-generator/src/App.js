import React, { useState, useEffect } from "react";
import {
  FiFile,
  FiEdit,
  FiUpload,
  FiLayers,
  FiPlayCircle,
  FiClock,
  FiCheckCircle,
  FiMenu,
} from "react-icons/fi"; // Import icons
import { AiOutlineClose } from "react-icons/ai"; // Close icon

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
      <p className="text-gray-700 text-lg font-medium">
        {displayedText}&nbsp;
      </p>
    </div>
  );
}

function App() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [navOpen, setNavOpen] = useState(false); // For mobile menu
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Event handlers
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
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg2MjA5MzU0LCJpYXQiOjE3MjYyMDk0MTQsImp0aSI6ImU0ZTQ4YzgxY2IzZTQ0ZDY5Nzg1NTlkOWRhNzY1ZjFhIiwidXNlcl9pZCI6Nn0.4qxEUE_DpO0S0NOo6b_AD2SZ6sGWnguUSezrU4WlIRI"; // Replace with your actual token

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

  // Template data
  const templates = [
    ["template5", "Standard"],
    ["template6", "Gaming theme"],
    ["template7", "Cosmic theme"],
    ["template8", "Legal theme"],
    ["template9", "Data centric theme"],
    ["template10", "Neurology theme"],
    ["template11", "Hello kitty theme"],
    ["template12", "Steampunk theme"],
    ["template13", "Nature theme"],
    ["template1", "Minimal standard"],
    ["template2", "Minimal dark green"],
    ["template3", "Minimal neutral"],
    ["template4", "Minimal light Red"],
  ];

  const templateImages = {
    template1: "template1.png",
    template2: "template2.png",
    template3: "template3.png",
    template4: "template4.png",
    template5: "template5.png",
    template6: "template6.png",
    template7: "template7.png",
    template8: "template8.png",
    template9: "template9.png",
    template10: "template10.png",
    template11: "template11.png",
    template12: "template12.png",
    template13: "template13.png",
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

  // Function to handle mouse enter on template
  const handleMouseEnter = (template, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredTemplate(template);
  };

  // Function to handle mouse leave on template
  const handleMouseLeave = () => {
    setHoveredTemplate(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-400 via-blue-300 to-blue-200 relative">
      {/* Navbar */}
      <header className="w-full bg-white bg-opacity-80 shadow-md fixed top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/">
            <img
              src="./images/intelliquery.png"
              alt="IntelliQuery Logo"
              className="h-8 md:h-10"
            />
          </a>
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-4">
            <a
              href="#"
              className="px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
            >
              Home
            </a>
            <a
              href="#"
              className="px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
            >
              My RAGs
            </a>
            <a
              href="#"
              className="px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
            >
              Login
            </a>
            <a
              href="#"
              className="px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
            >
              Register
            </a>
          </nav>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <AiOutlineClose size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        {/* Mobile Menu */}
        {navOpen && (
          <nav className="md:hidden bg-white bg-opacity-90 shadow-md">
            <div className="px-4 py-2 space-y-1">
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
              >
                Home
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
              >
                My RAGs
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
              >
                Login
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-800 rounded-md hover:text-purple-600 transition duration-300"
              >
                Register
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row gap-8 max-w-7xl mx-auto mt-24 px-4 mb-5 relative">
        {/* Form Section */}
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full md:w-1/2">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            RAG App Generator
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Description Input */}
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
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv,.rtf,.odt,.ods,.pptx,.ppt"
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

            {/* Template Selection Section */}
            <div className="mb-6 relative">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Template
              </label>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {templates.map(([template, displayName]) => (
                    <div
                      key={template}
                      className={`relative cursor-pointer p-4 border rounded-md transition duration-300 ease-in-out hover:shadow-md ${
                        selectedTemplate === template
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-300 bg-white"
                      }`}
                      onClick={() => handleTemplateSelection(template)}
                      onMouseEnter={(e) => handleMouseEnter(template, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span className="text-gray-700">{displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-center">
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
        <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            How to Use This App:
          </h2>
          <ul className="list-none text-gray-700 space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start leading-loose">
                <div className="flex-shrink-0 text-purple-600 mt-1">
                  {step.icon}
                </div>
                <p className="ml-3 text-base">{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hover Image Preview */}
      {hoveredTemplate && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y - 10, // Adjust the offset as needed
            transform: "translate(-50%, -100%)",
          }}
        >
          <img
            src={templateImages[hoveredTemplate]}
            alt={hoveredTemplate}
            className="max-w-xs w-auto h-auto object-contain outline rounded-md shadow-lg"
          />
        </div>
      )}

      {/* Generated URL Section */}
      {url && (
        <div className="my-10 mx-auto w-full max-w-md bg-purple-100 p-4 rounded-md text-center shadow-md">
          <p className="text-gray-800">
            Your generated app URL:{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline break-all"
            >
              {url}
            </a>
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white bg-opacity-80 w-full py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-700 text-sm">
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
















