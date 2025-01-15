import React, { useState } from 'react';
import './App.css';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReply = async () => {
    setLoading(true);
    setError('');
    setGeneratedReply('');
  
    try {
      const response = await fetch('http://localhost:8080/api/emailgenerator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent,
          tone,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate a reply. Please try again.');
      }
  
      // Get the raw response as text
      const rawResponse = await response.text(); // Get the response as plain text
  
      // Log it to see the raw response in the console
      console.log("Raw Response:", rawResponse);
  
      // Directly set the raw response as the generated reply
      setGeneratedReply(rawResponse); // No parsing required here, just set it as it is
  
    } catch (err) {
      console.error("Error:", err);
      setError('Failed to process the response or generate a reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply);
    alert('Reply copied to clipboard!');
  };

  return (
    <div className="container">
      <h1>AI - Email Reply Generator</h1>
      <textarea
        className="email-input"
        placeholder="Paste the email content here..."
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
      ></textarea>
      <select
        className="select-tone"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
      >
        <option value="" disabled>
          Select Tone
        </option>
        <option value="professional">Professional</option>
        <option value="casual">Casual</option>
        <option value="friendly">Friendly</option>
      </select>
      <button
        onClick={handleGenerateReply}
        disabled={loading || !emailContent || !tone}
        className="generate-button"
      >
        {loading ? 'Generating...' : 'Generate Reply'}
      </button>
      {error && <div className="error-message">{error}</div>}

      {generatedReply && (
        <div className="generated-reply-card">
          <p>{generatedReply}</p>
          <button onClick={handleCopyToClipboard} className="copy-button">
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
