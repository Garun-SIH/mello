import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, BookOpen, Users, Heart, Shield, Clock, ClipboardList } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'AI Chat Support',
      description: 'Get instant support with our AI-powered chatbot trained for student mental health',
      link: '/login',
      color: 'bg-blue-500'
    },
    {
      icon: Calendar,
      title: 'Book Counselor',
      description: 'Schedule confidential sessions with professional counselors',
      link: '/login',
      color: 'bg-green-500'
    },
    {
      icon: ClipboardList,
      title: 'Mental Health Assessments',
      description: 'Take validated assessments (PHQ-9, GAD-7, GHQ-12) to understand your well-being',
      link: '/login',
      color: 'bg-indigo-500'
    },
    {
      icon: BookOpen,
      title: 'Wellness Hub',
      description: 'Access curated resources for stress, anxiety, and academic pressure',
      link: '/login',
      color: 'bg-purple-500'
    },
    {
      icon: Users,
      title: 'Peer Support',
      description: 'Connect anonymously with fellow students in our supportive community',
      link: '/login',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    { number: '24/7', label: 'Support Available' },
    { number: '100%', label: 'Confidential' },
    { number: '500+', label: 'Students Helped' },
    { number: '50+', label: 'Resources Available' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">Mello</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your digital companion for mental wellness. Get support, resources, and connect with others 
            in a safe, confidential environment designed specifically for college students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-primary text-lg px-8 py-3">
              Login
            </Link>
            <Link to="/register" className="btn-outline text-lg px-8 py-3">
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl shadow-sm p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How Mello Can Help You
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="card hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`${feature.color} p-3 rounded-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
        <div className="text-center max-w-3xl mx-auto">
          <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy & Safety Matter</h2>
          <p className="text-gray-600 mb-6">
            All conversations are confidential and anonymous. Our platform follows strict privacy guidelines 
            to ensure your mental health journey remains secure and private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Available 24/7</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Student-focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Wellness Journey?</h2>
        <p className="text-gray-600 mb-8">Join thousands of students who have found support through Mello.</p>
        <Link to="/login" className="btn-primary text-lg px-8 py-3">
          Get Started Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
