import React, { useState, useRef } from 'react';
import { Upload, Send, FileText, Image, MessageCircle, AlertTriangle, Stethoscope, CheckCircle, Info } from 'lucide-react';

const FIPDiagnosticChatbot = () => {
  // All state declarations
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help assess your cat for potential FIP (Feline Infectious Peritonitis) based on established veterinary diagnostic protocols. I can analyze medical reports, X-rays, blood work, and symptoms.\n\nTo get started, please upload your cat\'s blood work (especially protein levels and A:G ratio) along with any other medical documents, X-rays, or describe symptoms.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const fileInputRef = useRef(null);

  // FIP Knowledge Base - extracted from the provided documents
  const fipKnowledgeBase = {
    types: {
      wet: "Usually beginning with high temperature, loss of appetite and lethargy, cats with Wet FIP have abdominal effusions usually accompanied with an enlarged abdominal cavity, basically the stomach appearing abnormally enlarged, rounded and bloated. Sometimes vomiting, diarrhea or jaundice are added.",
      pleural: "Showing similar symptoms of lethargy, high temperature and loss of appetite as Wet FIP, in Pleural FIP cats have thoracic (chest) effusions often accompanied with breathing problems (dyspnea). Sometimes this can be confused with pneumonia leading to delayed diagnosis.",
      dry: "Often more difficult to diagnose, Dry FIP also tends to be more chronic, progressing over a few weeks to months. With no fluid accumulation, this form presents itself with some subtle symptoms like fatigue and gradual weight loss, later accompanied with additional signs depending on the organs affected.",
      ocular: "When the virus manages to reach the eyes it's called Ocular FIP. Uveitis can affect the eyes, making them look cloudy and changing the colour of the iris. Conjunctivitis and inflammation or bleeding in the anterior chamber are common too.",
      neurological: "When the virus crosses the blood-brain barrier, inflammation can enter the brain and spinal cord and cause a spectrum of progressive neurologic abnormalities. Signs include ataxia (uncoordinated movements), head tilt, unsteady walk, floor or wall licking, postural reaction deficits, seizures, paralysis, personality changes and even dementia."
    },
    bloodworkIndicators: {
      wetFIP: {
        hematocrit: "reduced",
        reticulocyte: "normal to reduced",
        neutrophils: "increased",
        lymphocytes: "reduced",
        mcv: "reduced",
        totalProtein: "normal to elevated",
        albumin: "normal to reduced",
        globulins: "increased",
        gammaglobulins: "increased",
        ag: "reduced (<0.5)",
        bilirubin: "increased",
        acutePhaseProteins: "increased"
      },
      dryFIP: {
        hematocrit: "normal to reduced",
        reticulocyte: "normal to reduced",
        neutrophils: "increased",
        lymphocytes: "normal to reduced",
        mcv: "reduced",
        totalProtein: "normal to elevated",
        albumin: "normal to reduced",
        globulins: "increased",
        gammaglobulins: "increased",
        ag: "reduced (<0.5)",
        bilirubin: "normal to elevated",
        acutePhaseProteins: "increased"
      }
    },
    diagnosticTools: {
      ultrasound: "The presence of abdominal or thoracic fluid strongly supports a diagnosis of wet or pleural FIP. One of the earliest and most telling ultrasound signs is mesenteric lymphadenopathy. Other useful findings include hepatic and splenic changes, thickened intestinal walls with loss of layering, or peritoneal inflammation.",
      pcr: "A positive PCR result, especially on effusion or FNA from a lymph node- is highly specific for FIP. However, a negative result does not rule it out, especially in dry cases.",
      rivalta: "A simple, in-house test that can support FIP diagnosis. While it helps differentiate protein-rich effusions, it is not FIP-specific and both false positives and negatives are possible.",
      imaging: "MRI is particularly useful in neuro FIP - findings may include meningeal enhancement, ventricular dilation, or brain edema. CT scans may reveal fluid accumulation, lymphadenopathy, or organ abnormalities not clearly visible on ultrasound."
    },
    recommendedSamples: {
      wet: "Effusion",
      pleural: "Effusion",
      dry: "Fine needle aspirate of affected Mesenteric Lymph Nodes",
      ocular: "Aqueous humor",
      neurological: "Cerebrospinal fluid (via CSF tap)"
    }
  };

  // Simple file upload handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const analyzeWithOpenAI = async (userInput, files = []) => {
    if (!apiKey) {
      return "Please enter your OpenAI API key to continue.";
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      return "Invalid API key format. OpenAI API keys should start with 'sk-'. Please check your API key.";
    }

    try {
      // Prepare the system message with knowledge base
      const systemMessage = `You are a FIP (Feline Infectious Peritonitis) diagnostic assistant. You must base ALL responses EXCLUSIVELY on the following vetted knowledge base from FIP Warriors® India x FSGI Foundation and ABCD veterinary guidelines:

FIP TYPES AND SYMPTOMS:
${Object.entries(fipKnowledgeBase.types).map(([type, desc]) => `${type.toUpperCase()}: ${desc}`).join('\n\n')}

BLOOD WORK INDICATORS:
WET FIP: ${Object.entries(fipKnowledgeBase.bloodworkIndicators.wetFIP).map(([param, value]) => `${param}: ${value}`).join(', ')}
DRY FIP: ${Object.entries(fipKnowledgeBase.bloodworkIndicators.dryFIP).map(([param, value]) => `${param}: ${value}`).join(', ')}

DIAGNOSTIC TOOLS:
${Object.entries(fipKnowledgeBase.diagnosticTools).map(([tool, desc]) => `${tool.toUpperCase()}: ${desc}`).join('\n\n')}

CRITICAL DIAGNOSTIC PROTOCOL:
- A:G ratio <0.5 is THE MOST IMPORTANT FIP indicator
- Total protein, Globulins, Albumin are essential
- NEVER confirm FIP without proper blood parameters
- Use only "FIP should be considered" or "Strong clinical suspicion" without confirmatory tests
- Always emphasize veterinary consultation

ANALYSIS INSTRUCTIONS:
- Focus on A:G ratio as primary indicator
- Analyze images for FIP signs (fluid, lymphadenopathy, organ changes)
- Always request missing critical blood parameters
- Provide structured medical assessments`;

      // Prepare user message content
      let userMessageContent = [];
      
      // Add text content
      let textContent = "";
      
      if (userInput) {
        textContent += `Patient Information: ${userInput}\n\n`;
      }
      
      // Handle uploaded files
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      const pdfFiles = files.filter(f => f.type === 'application/pdf');
      const documentFiles = files.filter(f => !f.type.startsWith('image/') && f.type !== 'application/pdf');
      
      // Process images
      if (imageFiles.length > 0) {
        textContent += `${imageFiles.length} medical image(s) uploaded for analysis. Please examine for FIP indicators.\n\n`;
        
        for (const file of imageFiles) {
          try {
            const base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result.split(",")[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file.file);
            });

            userMessageContent.push({
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Data}`,
                detail: "high"
              }
            });
          } catch (error) {
            console.error("Error processing image:", error);
            textContent += `Error processing image: ${file.name}\n`;
          }
        }
      }
      
      // Process PDFs using OpenAI's native support
      if (pdfFiles.length > 0) {
        textContent += `${pdfFiles.length} PDF document(s) uploaded for analysis. Please read and analyze these documents for:\n- Blood work parameters and compare them against the FIP indicators\n- Veterinary reports and clinical findings\n- Lab results and diagnostic test outcomes\n- Any medical history or clinical observations relevant to FIP diagnosis\n\n`;
        
        for (const file of pdfFiles) {
          try {
            const base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result.split(",")[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file.file);
            });

            userMessageContent.push({
              type: "document",
              document: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Data
              }
            });
          } catch (error) {
            console.error("Error processing PDF:", error);
            textContent += `Error processing PDF: ${file.name}\n`;
          }
        }
      }
      
      if (documentFiles.length > 0) {
        textContent += `${documentFiles.length} other document(s) uploaded: ${documentFiles.map(f => f.name).join(', ')}\n\n`;
      }

      textContent += `Please provide a comprehensive FIP assessment:

1. **Critical Blood Parameters**: Check for A:G ratio, total protein, globulins
2. **Document Analysis** (if provided): Read and analyze uploaded PDFs for blood work, veterinary reports, lab results
3. **Image Analysis** (if provided): Identify any FIP-related findings in X-rays or photos
4. **Clinical Assessment**: Match symptoms to FIP types from knowledge base  
5. **Diagnostic Recommendations**: Next steps based on available data
6. **Veterinary Emphasis**: Stress professional consultation

Remember: A:G ratio <0.5 is the primary FIP indicator. Never confirm FIP without proper blood work.`;

      // Add text to user message content
      userMessageContent.push({
        type: "text",
        text: textContent
      });

      // Prepare messages for backend API
      const messages = [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: userMessageContent
        }
      ];

      console.log("Calling backend API...");

      // Call your Netlify function instead of OpenAI directly
      const apiEndpoint = '/.netlify/functions/openai';

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          apiKey: apiKey,
          model: "gpt-4o-mini" // Using mini model for cost efficiency
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend API Error:", errorData);
        
        if (response.status === 401) {
          return "❌ **Invalid API Key**: Please check your OpenAI API key and try again.";
        } else if (response.status === 429) {
          return "⏳ **Rate Limit**: Too many requests. Please wait a moment and try again.";
        } else if (response.status === 402) {
          return "💳 **Billing Issue**: Insufficient credits. Please check your OpenAI account billing.";
        } else {
          return `❌ **API Error** (${response.status}): ${errorData.error || 'Unknown error'}`;
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from API");
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error("Error in analyzeWithOpenAI:", error);
      
      if (error.message.includes('fetch')) {
        return `❌ **Connection Error**: Cannot connect to Netlify function. 

**If you're running locally**: 
- Make sure you're using \`netlify dev\` to run the development server
- The function should be available at \`/.netlify/functions/openai\`

**If deployed**: 
- Check that your Netlify function deployed successfully
- View function logs in Netlify dashboard

**For testing**: You can also try the Claude API version which works directly from the browser.`;
      }
      
      return `❌ **Error**: ${error.message}`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      role: 'user',
      content: inputMessage || 'I have uploaded files for analysis.',
      files: uploadedFiles
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputMessage('');
    setUploadedFiles([]);

    try {
      const response = await analyzeWithOpenAI(inputMessage, uploadedFiles);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or consult with your veterinarian.'
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Stethoscope className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">FIP Diagnostic Assistant</h1>
                <p className="text-blue-100 text-lg">Evidence-based FIP assessment using vetted veterinary protocols</p>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          {showApiKeyInput && (
            <div className="p-6 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-2">OpenAI API Key Required</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Please enter your OpenAI API key to use this diagnostic tool. Your key is stored locally and never shared.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        if (apiKey.trim()) {
                          setShowApiKeyInput(false);
                        }
                      }}
                      disabled={!apiKey.trim()}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Connect
                    </button>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showApiKeyInput && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Using CORS Proxy for Testing</span>
                </div>
                <button
                  onClick={() => {
                    setApiKey('');
                    setShowApiKeyInput(true);
                  }}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  Change API Key
                </button>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Note: For production deployment, you'll need a backend API to handle OpenAI calls securely.
              </p>
            </div>
          )}

          {/* Key Information Cards */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-800">Critical Parameter</h3>
                </div>
                <p className="text-sm text-gray-600">A:G ratio &lt;0.5 is the most important FIP indicator</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Essential Values</h3>
                </div>
                <p className="text-sm text-gray-600">Total protein, Globulins, Albumin required</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-800">Native PDF Support</h3>
                </div>
                <p className="text-sm text-gray-600">PDFs analyzed directly by OpenAI's advanced models</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Medical Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    This tool provides educational information only and follows strict diagnostic protocols. 
                    Always consult a qualified veterinarian for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-4xl rounded-2xl p-5 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.files && message.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {message.files.map((file, fileIndex) => (
                            <div key={fileIndex} className={`flex items-center gap-3 p-3 rounded-lg ${
                              message.role === 'user' ? 'bg-white bg-opacity-20' : 'bg-gray-50'
                            }`}>
                              {file.type.startsWith('image/') ? 
                                <Image className="w-4 h-4" /> : 
                                <FileText className="w-4 h-4" />
                              }
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs opacity-75">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-6">
            {uploadedFiles.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">Files ready for analysis:</p>
                </div>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        {file.type.startsWith('image/') ? 
                          <Image className="w-4 h-4 text-gray-500" /> : 
                          <FileText className="w-4 h-4 text-gray-500" />
                        }
                        <div>
                          <span className="text-sm font-medium text-gray-700">{file.name}</span>
                          {file.type === 'application/pdf' && (
                            <p className="text-xs text-green-600">✓ Will be analyzed by OpenAI</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Files
              </button>
              
              <div className="flex-1 flex gap-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your cat's symptoms, age, and any concerns..."
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
                  rows="3"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputMessage.trim() && uploadedFiles.length === 0)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Upload X-rays, blood reports, ultrasound images, or medical documents • Supported: PDF, JPG, PNG, DOC, TXT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIPDiagnosticChatbot;
