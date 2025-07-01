import { useState } from 'react';
import { Play, BookOpen, GraduationCap, Clock, Star, Filter } from 'lucide-react';
import { LearningResource } from '../types';
import { mockLearningResources } from '../services/mockData';

const LearningTab: React.FC = () => {
  const [resources] = useState<LearningResource[]>(mockLearningResources);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const types = ['all', 'video', 'article', 'course', 'tutorial'];

  const filteredResources = resources.filter(resource => {
    const difficultyMatch = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    const typeMatch = selectedType === 'all' || resource.type === selectedType;
    return difficultyMatch && typeMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play size={16} className="text-red-500" />;
      case 'course': return <GraduationCap size={16} className="text-green-500" />;
      case 'tutorial': return <BookOpen size={16} className="text-blue-500" />;
      default: return <BookOpen size={16} className="text-purple-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Section Header */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Learning</h2>
          <p className="text-gray-600 max-w-2xl leading-relaxed">
            Curated tutorials and courses to enhance your tech skills. From beginner-friendly introductions 
            to advanced masterclasses, discover resources that will accelerate your learning journey in 
            technology, programming, and innovation.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-gray-600 text-sm font-medium">Difficulty:</span>
            <div className="flex gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                    ${selectedDifficulty === difficulty
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm font-medium">Type:</span>
            <div className="flex gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                    ${selectedType === type
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Resources Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(resource.type)}
                  <span className="text-gray-600 text-sm font-medium capitalize">
                    {resource.type}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(resource.difficulty)}`}>
                  {resource.difficulty}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {resource.title}
              </h3>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {resource.description}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock size={14} />
                  <span>{resource.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  <Star size={14} />
                  <span>4.8</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300">
                Start Learning
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningTab;