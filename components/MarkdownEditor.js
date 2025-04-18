'use client';

import { useState } from 'react';

export default function MarkdownEditor({ markdown, onChange, isVisible }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full flex flex-col gap-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
      <div 
        className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium">Markdown 编辑器</h3>
        <button className="text-gray-500 dark:text-gray-400">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <textarea
            value={markdown}
            onChange={handleChange}
            className="w-full h-[300px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="在这里编辑您的 markdown..."
          />
        </div>
      )}
    </div>
  );
} 