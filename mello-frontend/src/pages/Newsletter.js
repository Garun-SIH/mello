import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Newsletter = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/newsletters');
      setNewsletters(response.data);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedNewsletter) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedNewsletter(null)}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center"
        >
          ← Back to newsletters
        </button>
        
        <article className="card">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedNewsletter.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {selectedNewsletter.author_name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(selectedNewsletter.published_at).toLocaleDateString()}
              </div>
            </div>
          </header>
          
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedNewsletter.content }} />
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Newsletter</h1>
        <p className="text-gray-600">Stay updated with the latest mental health tips, research, and resources</p>
      </div>

      {newsletters.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletters available</h3>
          <p className="text-gray-600">Check back later for new mental health content and updates.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {newsletters.map((newsletter) => (
            <div key={newsletter.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {newsletter.title}
                  </h2>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {newsletter.author_name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(newsletter.published_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {newsletter.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                  
                  <button
                    onClick={() => setSelectedNewsletter(newsletter)}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="ml-6">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Newsletter;
