import  { useState } from 'react';
import { Code, Download, Clock, Star, Zap, Filter } from 'lucide-react';
import { ProjectTemplate } from '../types';
import { mockProjectTemplates } from '../services/mockData';

const ImplementationTab: React.FC = () => {
  const [templates] = useState<ProjectTemplate[]>(mockProjectTemplates);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredTemplates = selectedDifficulty === 'all' 
    ? templates 
    : templates.filter(template => template.difficulty === selectedDifficulty);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const toggleExpanded = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Section Header */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Projects</h2>
          <p className="text-gray-600 max-w-2xl leading-relaxed">
            Ready-to-use project templates with complete setup guides. Transform your ideas into reality 
            with our carefully crafted templates that include everything you need to get started quickly 
            and efficiently.
          </p>
        </div>

        {/* Difficulty Filter */}
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
      </div>

      {/* Project Templates */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="space-y-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code size={20} className="text-red-500" />
                  <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {template.description}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock size={14} />
                  <span>{template.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  <Star size={14} />
                  <span>4.9</span>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-sm">
                  <Zap size={14} />
                  <span>Quick Start</span>
                </div>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-600 border border-blue-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => toggleExpanded(template.id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
                >
                  {expandedTemplate === template.id ? 'Hide Details' : 'View Details'}
                </button>
                <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300">
                  <Download size={16} />
                  Clone
                </button>
              </div>

              {/* Expanded Details */}
              {expandedTemplate === template.id && (
                <div className="border-t border-gray-200 pt-4 space-y-4 animate-fadeIn">
                  {/* Dependencies */}
                  <div>
                    <h4 className="text-gray-800 font-medium mb-2">Dependencies:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-green-600 text-sm">
                        npm install {template.dependencies.join(' ')}
                      </code>
                    </div>
                  </div>

                  {/* Project Structure */}
                  <div>
                    <h4 className="text-gray-800 font-medium mb-2">Project Structure:</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      {template.structure.map((path, index) => (
                        <div key={index} className="text-gray-600 text-sm font-mono">
                          📁 {path}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippet */}
                  {template.codeSnippet && (
                    <div>
                      <h4 className="text-gray-800 font-medium mb-2">Sample Code:</h4>
                      <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-sm text-gray-700">
                          <code>{template.codeSnippet}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImplementationTab;