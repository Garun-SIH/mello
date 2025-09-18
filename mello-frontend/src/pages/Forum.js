import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Plus, Filter, Clock, User } from 'lucide-react';
import axios from 'axios';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    alias: '',
    content: '',
    category: 'general'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/api/posts', { params });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/posts/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.alias.trim() || !newPost.content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/posts', newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ alias: '', content: '', category: 'general' });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.put(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: response.data.likes }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      stress: 'bg-red-100 text-red-800',
      anxiety: 'bg-yellow-100 text-yellow-800',
      sleep: 'bg-blue-100 text-blue-800',
      depression: 'bg-purple-100 text-purple-800',
      academic: 'bg-indigo-100 text-indigo-800',
      social: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return postTime.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Peer Support Forum</h1>
        <p className="text-gray-600">
          Connect with fellow students in a safe, anonymous environment. 
          Share experiences, offer support, and find community.
        </p>
      </div>

      {/* Action Bar */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
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
            
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear Filter
              </button>
            )}
          </div>

          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreatePost && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Anonymous Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anonymous Alias
                </label>
                <input
                  type="text"
                  value={newPost.alias}
                  onChange={(e) => setNewPost({...newPost, alias: e.target.value})}
                  placeholder="e.g., StressedStudent22"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="stress">Stress</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="sleep">Sleep</option>
                  <option value="depression">Depression</option>
                  <option value="academic">Academic</option>
                  <option value="social">Social</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Share what's on your mind... Remember, this is a supportive space."
                className="input-field h-32 resize-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Anonymously'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to start a conversation in this category.
          </p>
          <button
            onClick={() => setShowCreatePost(true)}
            className="btn-primary"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="card hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{post.alias}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                
                <div className="text-sm text-gray-500">
                  {post.moderated ? (
                    <span className="text-green-600">✓ Moderated</span>
                  ) : (
                    <span className="text-yellow-600">⏳ Pending moderation</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Guidelines */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-800 mb-3">Community Guidelines</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Be respectful and supportive of others</li>
          <li>• Keep posts anonymous - don't share personal identifying information</li>
          <li>• Focus on mental health and wellness topics</li>
          <li>• If you're in crisis, please seek immediate professional help</li>
          <li>• Report any inappropriate content to moderators</li>
        </ul>
      </div>
    </div>
  );
};

export default Forum;
