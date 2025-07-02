import React, { useState, useEffect } from 'react';

const AboutMe: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { icon: "🛡️", title: "Secure Voting", description: "JWT authentication and encrypted access codes" },
    { icon: "👥", title: "Public & Private Polls", description: "Create polls for everyone or restrict access" },
    { icon: "📊", title: "Real-time Analytics", description: "Beautiful charts and detailed vote statistics" },
    { icon: "📱", title: "Responsive Design", description: "Works perfectly on all devices" },
    { icon: "🌐", title: "Easy Sharing", description: "Share polls via WhatsApp, Email, or direct links" },
    { icon: "🚀", title: "Admin Dashboard", description: "Comprehensive management tools for administrators" }
  ];

  const techStack = [
    { icon: "⚛️", name: "React", category: "Frontend" },
    { icon: "📘", name: "TypeScript", category: "Language" },
    { icon: "🎨", name: "Tailwind CSS", category: "Styling" },
    { icon: "⚡", name: "Vite", category: "Build Tool" },
    { icon: "🟢", name: "Node.js", category: "Backend" },
    { icon: "🚂", name: "Express.js", category: "Framework" },
    { icon: "🍃", name: "MongoDB", category: "Database" },
    { icon: "🔐", name: "JWT", category: "Authentication" },
    { icon: "🔒", name: "Bcrypt", category: "Security" },
    { icon: "🗄️", name: "Mongoose", category: "ORM" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold shadow-lg mb-6 animate-pulse">
            🗳️
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            VoteSnap
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A modern, secure, and user-friendly online polling platform designed to make voting and poll management effortless for everyone.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
              <span className="text-red-500 animate-pulse">❤️</span>
              <span className="text-sm font-medium">Made with Love</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
              <span className="text-blue-500">💻</span>
              <span className="text-sm font-medium">Open Source</span>
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className={`grid md:grid-cols-2 gap-12 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Main Developer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="text-center mb-6">
              <img 
                src="https://avatars.githubusercontent.com/u/102648347?v=4" 
                alt="Harshil Somisetty" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-lg mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Harshil Somisetty</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">Full Stack Developer & Creator</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Passionate developer with expertise in modern web technologies. 
                Created VoteSnap to solve real-world polling challenges with a focus on security, usability, and performance.
              </p>
              <div className="flex justify-center space-x-4">
                <a href="https://github.com/harshilsomisetty" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-2xl">
                  📱
                </a>
                <a href="https://linkedin.com/in/harshilsomisetty" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors text-2xl">
                  💼
                </a>
                <a href="mailto:harshilsomisetty@gmail.com" className="text-red-600 hover:text-red-800 transition-colors text-2xl">
                  ✉️
                </a>
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300 text-white">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm text-6xl font-bold shadow-lg mx-auto mb-4">
                🤖
              </div>
              <h3 className="text-2xl font-bold mb-2">CURSOR AI</h3>
              <p className="text-purple-100 font-medium mb-4">AI Assistant & Co-Creator</p>
              <p className="text-purple-100 mb-6">
                Advanced AI assistant that helped bring VoteSnap to life through intelligent code generation, 
                design suggestions, and collaborative development.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">Collaborative</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className={`mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-3">{tech.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tech.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tech.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Stats */}
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-16 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-white mb-8">Project Highlights</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-100">TypeScript</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Secure</div>
              <div className="text-blue-100">Authentication</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Real-time</div>
              <div className="text-blue-100">Analytics</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Responsive</div>
              <div className="text-blue-100">Design</div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get In Touch</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions, suggestions, or want to collaborate? I'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="mailto:harshilsomisetty@gmail.com"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors duration-300 flex items-center space-x-2"
            >
              <span>✉️</span>
              <span>Email Me</span>
            </a>
            <a 
              href="https://github.com/harshilsomisetty"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-full font-medium transition-colors duration-300 flex items-center space-x-2"
            >
              <span>📱</span>
              <span>GitHub</span>
            </a>
          </div>
      </div>

        {/* Footer */}
        <div className={`text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 transition-all duration-1000 delay-1100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-gray-600 dark:text-gray-400">
            Made with <span className="inline text-red-500 animate-pulse">❤️</span> by Harshil & CURSOR AI
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            © 2024 VoteSnap. All rights reserved.
          </p>
      </div>
      </div>
    </div>
  );
};

export default AboutMe; 