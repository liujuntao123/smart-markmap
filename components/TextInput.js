'use client';

import { useState } from 'react';

export default function TextInput({ onTextSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        <textarea
          className="w-full h-31 p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 resize-y"
          placeholder="在这里粘贴或输入文本..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          disabled={!text.trim()}
        >
          转换为思维导图
        </button>
      </div>
    </form>
  );
} 