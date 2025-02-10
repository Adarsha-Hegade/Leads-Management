import React from 'react';
import { Grid, List, Columns } from 'lucide-react';

export type ViewType = 'grid' | 'list' | 'kanban';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-white border border-gray-300 rounded-lg">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 ${
          currentView === 'grid'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        } rounded-l-lg`}
        title="Grid View"
      >
        <Grid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 border-l border-r border-gray-300 ${
          currentView === 'list'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        title="List View"
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewChange('kanban')}
        className={`p-2 ${
          currentView === 'kanban'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        } rounded-r-lg`}
        title="Kanban View"
      >
        <Columns className="w-5 h-5" />
      </button>
    </div>
  );
}