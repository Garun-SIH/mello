import React, { useState, useEffect } from 'react';
import { Upload, FileText, BookOpen, Plus, Trash2, Edit, File, Video, Music, FileImage, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadFileToStorage, formatFileSize, validateFile } from '../../utils/firebaseStorage';

const ContentUpload = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [contentType, setContentType] = useState('newsletter');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    language: 'en',
    url: '',
    description: ''
  });
  const [existingContent, setExistingContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState('checking');

  useEffect(() => {
    fetchExistingContent();
    checkFirebaseConfig();
  }, []);

  const checkFirebaseConfig = () => {
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    
    const missingConfigs = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingConfigs.length > 0) {
      setFirebaseStatus('not-configured');
      console.warn('Firebase not configured. Missing:', missingConfigs);
    } else {
      setFirebaseStatus('configured');
      console.log('Firebase configuration found');
    }
  };

  const fetchExistingContent = async () => {
    try {
      const axios = getAuthenticatedAxios();
      let endpoint = '';
      
      switch (contentType) {
        case 'newsletter':
          endpoint = '/api/admin/newsletters';
          break;
        case 'resource':
          endpoint = '/api/admin/resources';
          break;
        default:
          return;
      }
      
      const response = await axios.get(endpoint);
      setExistingContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  // File handling functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    
    // If category is selected, validate against it
    if (formData.category) {
      const fileValidation = getFileValidation(formData.category);
      const validation = validateFile(file, fileValidation.allowedTypes, fileValidation.maxSizeMB);
      
      if (!validation.isValid) {
        setUploadError(validation.errors.join(', '));
        return;
      }
    } else {
      // If no category selected, just check general file size (max 100MB)
      const maxSizeBytes = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSizeBytes) {
        setUploadError('File size must be less than 100MB. Please select a category for specific limits.');
        return;
      }
    }
    
    setSelectedFile(file);
  };

  const getFileValidation = (category) => {
    switch (category) {
      case 'video':
        return {
          allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
          maxSizeMB: 100 // 100MB for videos
        };
      case 'audio':
        return {
          allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
          maxSizeMB: 50 // 50MB for audio
        };
      case 'article':
        return {
          allowedTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          maxSizeMB: 10 // 10MB for documents
        };
      case 'exercise':
        return {
          allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
          maxSizeMB: 20 // 20MB for exercise materials
        };
      default:
        return {
          allowedTypes: [],
          maxSizeMB: 0
        };
    }
  };

  const uploadFileToFirebase = async () => {
    if (!selectedFile) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Check if Firebase is configured
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
      };
      
      // Check if any config values are missing
      const missingConfigs = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missingConfigs.length > 0) {
        throw new Error(`Firebase configuration missing: ${missingConfigs.join(', ')}. Please check your .env file.`);
      }
      
      console.log('Starting file upload:', selectedFile.name);
      const storagePath = `resources/${formData.category || 'general'}/`;
      const downloadURL = await uploadFileToStorage(
        selectedFile,
        storagePath,
        (progress) => {
          console.log('Upload progress:', progress);
          setUploadProgress(progress);
        }
      );
      
      console.log('Upload completed:', downloadURL);
      setIsUploading(false);
      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadError('Failed to upload file: ' + error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const axios = getAuthenticatedAxios();
      let endpoint = '';
      let payload = { ...formData };

      // Upload file to Firebase if selected (for resources)
      if (contentType === 'resource' && selectedFile && !editingId) {
        const fileURL = await uploadFileToFirebase();
        payload.url = fileURL; // Use Firebase URL instead of manual URL
      }

      switch (contentType) {
        case 'newsletter':
          endpoint = editingId ? `/api/admin/newsletters/${editingId}` : '/api/admin/newsletters';
          break;
        case 'resource':
          endpoint = editingId ? `/api/admin/resources/${editingId}` : '/api/admin/resources';
          payload.type = formData.category; // Map category to type for resources
          break;
        default:
          throw new Error('Invalid content type');
      }

      if (editingId) {
        await axios.put(endpoint, payload);
        alert('Content updated successfully!');
      } else {
        await axios.post(endpoint, payload);
        alert('Content created successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        language: 'en',
        url: '',
        description: ''
      });
      setEditingId(null);
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadError('');
      fetchExistingContent();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || item.type || '',
      language: item.language || 'en',
      url: item.url || '',
      description: item.description || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const axios = getAuthenticatedAxios();
      let endpoint = '';
      
      switch (contentType) {
        case 'newsletter':
          endpoint = `/api/admin/newsletters/${id}`;
          break;
        case 'resource':
          endpoint = `/api/admin/resources/${id}`;
          break;
        default:
          return;
      }

      await axios.delete(endpoint);
      alert('Content deleted successfully!');
      fetchExistingContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const renderForm = () => {
    switch (contentType) {
      case 'newsletter':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter newsletter title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your newsletter content here..."
                required
              />
            </div>
          </>
        );

      case 'resource':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter resource title"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="audio">Audio</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="mr">Marathi</option>
                  <option value="ks">Kashmiri</option>
                  <option value="doi">Dogri</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
            </div>

            {/* File Upload or URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource File or URL
              </label>
              
              {/* Firebase Status Indicator */}
              {firebaseStatus === 'not-configured' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">Firebase not configured</p>
                    <p className="text-yellow-600">File upload will not work. Please set up Firebase in your .env file.</p>
                  </div>
                </div>
              )}

              {/* File Upload Section - Always visible */}
              <div className="mb-4">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  firebaseStatus === 'configured' 
                    ? 'border-gray-300 hover:border-primary-400' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept={formData.category ? getFileValidation(formData.category).allowedTypes.join(',') : '*/*'}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      {formData.category === 'video' && <Video className="h-8 w-8 text-gray-400 mb-2" />}
                      {formData.category === 'audio' && <Music className="h-8 w-8 text-gray-400 mb-2" />}
                      {formData.category === 'article' && <File className="h-8 w-8 text-gray-400 mb-2" />}
                      {formData.category === 'exercise' && <FileImage className="h-8 w-8 text-gray-400 mb-2" />}
                      {!formData.category && <Upload className="h-8 w-8 text-gray-400 mb-2" />}
                      
                      <p className="text-sm text-gray-600">
                        {formData.category 
                          ? `Click to upload ${formData.category} file or drag and drop`
                          : 'Click to upload file or drag and drop (select category first for validation)'
                        }
                      </p>
                      {formData.category && (
                        <p className="text-xs text-gray-400 mt-1">
                          Max size: {getFileValidation(formData.category).maxSizeMB}MB
                        </p>
                      )}
                      {!formData.category && (
                        <p className="text-xs text-gray-400 mt-1">
                          Select a category above to see file type restrictions
                        </p>
                      )}
                    </div>
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadProgress(0);
                          setUploadError('');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% uploaded</p>
                      </div>
                    )}
                  </div>
                )}
                
                {uploadError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">{uploadError}</p>
                  </div>
                )}
                
                <div className="mt-3 text-center text-sm text-gray-500">
                  OR
                </div>
              </div>
              
              {/* URL Input */}
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/resource (or upload file above)"
                required={!selectedFile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe this resource..."
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">Create and manage newsletters and resources</p>
      </div>

      {/* Content Type Selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => {
            setContentType('newsletter');
            setEditingId(null);
            setFormData({title: '', content: '', category: '', language: 'en', url: '', description: ''});
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            contentType === 'newsletter'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Newsletters
        </button>
        <button
          onClick={() => {
            setContentType('resource');
            setEditingId(null);
            setFormData({title: '', content: '', category: '', language: 'en', url: '', description: ''});
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            contentType === 'resource'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Resources
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            {editingId ? 'Edit' : 'Create'} {contentType === 'newsletter' ? 'Newsletter' : 'Resource'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({title: '', content: '', category: '', language: 'en', url: '', description: ''});
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Content */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Existing {contentType === 'newsletter' ? 'Newsletters' : 'Resources'}
          </h2>

          {existingContent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No {contentType === 'newsletter' ? 'newsletters' : 'resources'} created yet.
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {existingContent.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {contentType === 'resource' && item.type && (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                            {item.type}
                          </span>
                        )}
                        {new Date(item.created_at || item.published_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentUpload;
