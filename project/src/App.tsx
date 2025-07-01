import  { useState } from 'react';
import { Lightbulb, Search } from 'lucide-react';
import TabNavigation from './components/TabNavigation';
import NewsTab from './components/NewsTab';
import LearningTab from './components/LearningTab';
import ImplementationTab from './components/ImplementationTab';
import Chatbot from './components/Chatbot';

function App() {
  const [activeTab, setActiveTab] = useState('news');
  const [searchQuery, setSearchQuery] = useState('');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'news':
        return <NewsTab searchQuery={searchQuery} />;
      case 'learning':
        return <LearningTab />;
      case 'implementation':
        return <ImplementationTab />;
      default:
        return <NewsTab searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 overflow-hidden">
      {/* Main Container */}
      <div className="h-full bg-white/95 backdrop-blur-sm rounded-3xl m-4 shadow-2xl flex flex-col">
        
        {/* Header Section */}
        <header className="flex-shrink-0 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-xl shadow-lg">
                <Lightbulb size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Idea Generator
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search news, topics, or ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {renderActiveTab()}
        </main>

        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}

export default App;