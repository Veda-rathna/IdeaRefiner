
import { Newspaper, BookOpen, Code } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'news', label: 'LATEST', icon: Newspaper },
    { id: 'learning', label: 'LEARNING', icon: BookOpen },
    { id: 'implementation', label: 'PROJECTS', icon: Code },
  ];

  return (
    <div className="flex space-x-8">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`
            flex items-center gap-2 px-4 py-2 font-semibold text-sm tracking-wide transition-all duration-300 relative
            ${activeTab === id
              ? 'text-gray-800'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          <Icon size={18} />
          <span>{label}</span>
          {activeTab === id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;