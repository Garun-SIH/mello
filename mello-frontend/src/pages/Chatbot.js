import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Mello, your mental health support companion. I'm here to help you with stress, anxiety, sleep issues, or just to listen. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentId] = useState(() => `student_${Math.random().toString(36).substr(2, 9)}`);
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to:', `${process.env.REACT_APP_API_URL}/api/chat`);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat`, {
        message: inputMessage,
        student_id: studentId
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        category: response.data.category
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (response.data.escalate_to_counselor) {
        setShowEscalation(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorText = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error.response?.status === 422) {
        errorText = "There was an issue with the message format. Please try rephrasing your message.";
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorText = "Unable to connect to the server. Please check if the backend is running.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickResponses = [
    "I'm feeling stressed about exams",
    "I can't sleep well lately",
    "I'm feeling anxious",
    "I need help with time management",
    "I'm feeling overwhelmed"
  ];

  const handleQuickResponse = (response) => {
    setInputMessage(response);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat with Mello</h1>
            <p className="text-gray-600">Your AI mental health companion</p>
          </div>
        </div>

        {showEscalation && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800">Professional Support Recommended</h3>
                <p className="text-orange-700 text-sm mt-1">
                  Based on our conversation, I recommend speaking with a professional counselor. 
                  <a href="/booking" className="underline ml-1">Book a session here</a>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 mb-4 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-primary-600' 
                  : message.isError 
                    ? 'bg-red-500' 
                    : 'bg-secondary-600'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className={`flex-1 ${
                message.sender === 'user' ? 'text-right max-w-xs' : 'max-w-sm'
              }`}>
                <div className={`inline-block rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isError
                      ? 'bg-red-100 text-red-800'
                      : 'bg-white text-gray-900 shadow-sm'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Buttons */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick responses:</p>
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => handleQuickResponse(response)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {response}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Privacy & Confidentiality</h3>
        <p className="text-blue-700 text-sm">
          Your conversations are confidential and used only to provide you with better support. 
          If you're experiencing a mental health emergency, please contact your local emergency services 
          or a crisis helpline immediately.
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
