import React, { useState, useEffect } from 'react';
import { Upload, FileText,BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

  useEffect(() => {
    fetchExistingContent();
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const axios = getAuthenticatedAxios();
      let endpoint = '';
      let payload = { ...formData };

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
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/resource"
                required
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
