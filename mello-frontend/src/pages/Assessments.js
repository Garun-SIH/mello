import React, { useState, useEffect } from 'react';
import {Brain, Heart, TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';

const Assessments = () => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [assessmentData, setAssessmentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [studentId] = useState(() => `student_${Math.random().toString(36).substr(2, 9)}`);

  const assessmentTypes = [
    {
      id: 'phq9',
      title: 'PHQ-9 Depression Assessment',
      description: 'Assess symptoms of depression over the past 2 weeks',
      icon: Brain,
      color: 'bg-blue-500',
      duration: '5-7 minutes'
    },
    {
      id: 'gad7',
      title: 'GAD-7 Anxiety Assessment',
      description: 'Evaluate anxiety symptoms and their impact',
      icon: Heart,
      color: 'bg-green-500',
      duration: '3-5 minutes'
    },
    {
      id: 'ghq',
      title: 'GHQ-12 General Health',
      description: 'Overall psychological well-being assessment',
      icon: TrendingUp,
      color: 'bg-purple-500',
      duration: '4-6 minutes'
    }
  ];

  useEffect(() => {
    fetchHistory();
  });

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assessments/history/${studentId}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const startAssessment = async (assessmentType) => {
    console.log('Starting assessment:', assessmentType);
    setIsLoading(true);
    try {
      console.log('Making request to:', `${process.env.REACT_APP_API_URL}/api/assessments/questions/${assessmentType}`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assessments/questions/${assessmentType}`);
      console.log('Assessment data received:', response.data);
      setAssessmentData(response.data);
      setSelectedAssessment(assessmentType);
      setCurrentQuestion(0);
      setResponses([]);
      setResult(null);
    } catch (error) {
      console.error('Error loading assessment:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error loading assessment: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = (value) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestion < assessmentData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/assessments/submit`, {
        student_id: studentId,
        assessment_type: selectedAssessment,
        responses: responses
      });
      setResult(response.data);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssessment = () => {
    setSelectedAssessment(null);
    setCurrentQuestion(0);
    setResponses([]);
    setAssessmentData(null);
    setResult(null);
  };

  const getSeverityColor = (severity) => {
    if (severity.includes('Minimal') || severity.includes('Good')) return 'text-green-600 bg-green-50';
    if (severity.includes('Mild')) return 'text-yellow-600 bg-yellow-50';
    if (severity.includes('Moderate')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressPercentage = () => {
    if (!assessmentData) return 0;
    return ((currentQuestion + 1) / assessmentData.questions.length) * 100;
  };

  // Assessment Selection Screen
  if (!selectedAssessment) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mental Health Assessments</h1>
          <p className="text-gray-600">
            Take validated mental health assessments to better understand your well-being. 
            These tools can help identify areas where you might benefit from additional support.
          </p>
        </div>

        {/* Assessment History */}
        {history && history.latest_scores && Object.keys(history.latest_scores).length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Latest Scores</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(history.latest_scores).map(([type, data]) => {
                const assessment = assessmentTypes.find(a => a.id === type);
                return (
                  <div key={type} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <assessment.icon className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">{assessment.title}</h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-900">{data.score}</p>
                      <p className={`text-sm px-2 py-1 rounded-full ${getSeverityColor(data.severity)}`}>
                        {data.severity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(data.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assessment Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {assessmentTypes.map((assessment) => (
            <div key={assessment.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <div className={`${assessment.color} p-3 rounded-lg`}>
                  <assessment.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{assessment.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{assessment.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{assessment.duration}</span>
                    <button
                      onClick={() => {
                        console.log('Button clicked for assessment:', assessment.id);
                        startAssessment(assessment.id);
                      }}
                      className="btn-primary text-sm px-4 py-2"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Start Assessment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">About These Assessments</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• These are validated screening tools used by healthcare professionals</li>
                <li>• Results are confidential and stored securely</li>
                <li>• Assessments are not diagnostic tools - consult a professional for diagnosis</li>
                <li>• You can retake assessments to track your progress over time</li>
                <li>• If you're in crisis, please seek immediate professional help</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment Result Screen
  if (result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete</h2>
            <p className="text-gray-600">Thank you for completing the {assessmentData.title}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Score</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">{result.total_score}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity_level)}`}>
                  {result.severity_level}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Date Completed</h3>
                <p className="text-gray-600">{new Date(result.completed_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">{result.recommendations}</p>
            </div>
          </div>

          {result.severity_level.includes('Moderate') || result.severity_level.includes('Severe') ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Consider Professional Support</h4>
                  <p className="text-orange-700 text-sm mt-1">
                    Based on your results, we recommend speaking with a professional counselor.
                    <a href="/booking" className="underline ml-1">Book a session here</a>.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-center space-x-4">
            <button onClick={resetAssessment} className="btn-outline">
              Take Another Assessment
            </button>
            <a href="/resources" className="btn-primary">
              Explore Resources
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Assessment Questions Screen
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-900">{assessmentData.title}</h2>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {assessmentData.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-gray-600 mb-4">{assessmentData.description}</p>
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {assessmentData.questions[currentQuestion]}
          </h3>

          {/* Response Options */}
          <div className="space-y-3">
            {assessmentData.scale.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  responses[currentQuestion] === index
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={responses[currentQuestion] === index}
                  onChange={() => handleResponse(index)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  responses[currentQuestion] === index
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {responses[currentQuestion] === index && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button onClick={resetAssessment} className="btn-outline">
              Cancel
            </button>
            
            {currentQuestion === assessmentData.questions.length - 1 ? (
              <button
                onClick={submitAssessment}
                disabled={responses[currentQuestion] === undefined || isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Assessment'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={responses[currentQuestion] === undefined}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;
