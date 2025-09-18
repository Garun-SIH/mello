import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, FileText, Headphones, Globe } from 'lucide-react';
import axios from 'axios';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedCategory, selectedLanguage, selectedType, searchTerm]);

  const fetchResources = async () => {
    try {
      const response = await axios.get('/api/resources');
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/resources/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedLanguage) {
      filtered = filtered.filter(resource => resource.language === selectedLanguage);
    }

    if (selectedType) {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'article':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      stress: 'bg-red-100 text-red-800',
      anxiety: 'bg-yellow-100 text-yellow-800',
      sleep: 'bg-blue-100 text-blue-800',
      mindfulness: 'bg-green-100 text-green-800',
      depression: 'bg-purple-100 text-purple-800',
      academic: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedLanguage('');
    setSelectedType('');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Wellness Resource Hub</h1>
        <p className="text-gray-600">
          Discover curated resources to support your mental health journey. 
          Find videos, articles, and audio content in multiple languages.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input-field"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="article">Articles</option>
            </select>

            <button
              onClick={clearFilters}
              className="btn-outline whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {(selectedCategory || selectedLanguage || selectedType || searchTerm) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredResources.length} of {resources.length} resources
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedLanguage && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                    Language: {selectedLanguage === 'en' ? 'English' : 'Hindi'}
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                    Type: {selectedType}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="text-primary-600">
                    {getResourceIcon(resource.type)}
                  </div>
                  <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {resource.language === 'hi' && (
                    <Globe className="h-4 w-4 text-orange-500" title="Hindi" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                    {resource.category}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>

              {resource.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                {resource.duration && (
                  <span className="text-sm text-gray-500">{resource.duration}</span>
                )}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Access Resource
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories Overview */}
      <div className="mt-12 card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resource Categories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => {
            const categoryCount = resources.filter(r => r.category === category).length;
            return (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
              >
                <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
                <p className="text-sm text-gray-600">{categoryCount} resources</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Resources;
