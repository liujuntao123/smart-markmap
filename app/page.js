'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput';
import ApiSettings from '../components/ApiSettings';
import MindMap from '../components/MindMap';
import MarkdownEditor from '../components/MarkdownEditor';

export default function Home() {
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [apiSettings, setApiSettings] = useState({ apiKey: '', apiEndpoint: '', modelId: 'deepseek-chat-v3' });
  const [error, setError] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [mindMapVisible, setMindMapVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (content, fileName) => {
    await generateMindMap(content, fileName);
  };

  const handleTextSubmit = async (text) => {
    await generateMindMap(text);
  };

  const handleApiSettingsChange = useCallback((settings) => {
    setApiSettings(settings);
  }, []);

  const handleMarkdownChange = (newMarkdown) => {
    setMarkdown(newMarkdown);
  };

  const generateMindMap = async (text, fileName = 'document') => {
    setError('');
    setMindMapVisible(false);
    setMarkdown(''); // 清空之前的结果
    setLoading(true); // 开始加载

    try {
      if (!apiSettings.apiKey) {
        setLoading(false);
        throw new Error('请先在设置中配置您的DeepSeek API密钥');
      }

      // Check if text is exceeding the maximum size before even sending to API
      const MAX_CHAR_LIMIT = 131072; // Match with server constant
      if (text.length > MAX_CHAR_LIMIT) {
        setLoading(false);
        throw new Error(`文件内容超过API限制（${MAX_CHAR_LIMIT}字符），请上传较小的文件`);
      }

      const response = await fetch('/api/generate-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          apiKey: apiSettings.apiKey,
          apiEndpoint: apiSettings.apiEndpoint,
          modelId: apiSettings.modelId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setLoading(false);
        throw new Error(data.error || '生成思维导图失败');
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialMarkdown = ''; // 用于存储累积的Markdown内容
      
      // 当接收到第一个数据块后显示思维导图区域
      let isFirstChunk = true;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setLoading(false);
            break;
          }
          
          // 解码接收到的数据
          const chunk = decoder.decode(value, { stream: true });
          
          // 处理可能包含多个JSON对象的数据块
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              // 检查是否有错误
              if (data.error) {
                setLoading(false);
                throw new Error(data.error);
              }
              
              // 处理完整的响应数据（当done为true时）
              if (data.done && data.markdown) {
                setMarkdown(data.markdown);
                if (isFirstChunk) {
                  setMindMapVisible(true);
                  isFirstChunk = false;
                }
                continue;
              }
              
              // 处理部分响应数据
              if (data.markdown) {
                partialMarkdown = data.markdown;
                setMarkdown(partialMarkdown);
                
                // 如果这是第一个有内容的响应，显示思维导图
                if (isFirstChunk) {
                  setMindMapVisible(true);
                  isFirstChunk = false;
                }
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e, line);
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        setLoading(false);
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <circle cx="9" cy="9" r="5" />
              <polyline points="16 4 20 4 20 8" />
              <line x1="14.5" y1="9.5" x2="20" y2="4" />
              <circle cx="9" cy="15" r="5" />
              <path d="M8 9.1v1.8a.79.79 0 0 0 .81.8h2.38a.79.79 0 0 0 .81-.81v-1.8a.79.79 0 0 0-.81-.79h-2.38a.79.79 0 0 0-.81.79Z" />
              <path d="M8 15.1v1.8a.79.79 0 0 0 .81.8h2.38a.79.79 0 0 0 .81-.81v-1.8a.79.79 0 0 0-.81-.79h-2.38a.79.79 0 0 0-.81.79Z" />
            </svg>
            <h1 className="text-xl font-bold">智能思维导图</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/liujuntao123/smart-markmap" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              支持作者
            </a>
            <ApiSettings onSettingsChange={handleApiSettingsChange} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-8xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">轻松将您的文本转换为思维导图</h2>
          </div>

          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
            <button
              onClick={() => setInputMode('file')}
              className={`pb-2 px-1 ${
                inputMode === 'file'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              上传文件
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`pb-2 px-1 ${
                inputMode === 'text'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              输入文本
            </button>
          </div>

          <div className="min-h-32">
            {inputMode === 'file' ? (
              <FileUpload onFileUpload={handleFileUpload} />
            ) : (
              <TextInput onTextSubmit={handleTextSubmit} />
            )}
          </div>

          {loading && (
            <div className="p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在生成思维导图，请稍候...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <MarkdownEditor 
            markdown={markdown} 
            onChange={handleMarkdownChange} 
            isVisible={mindMapVisible} 
          />

          <MindMap markdown={markdown} isVisible={mindMapVisible} />
        </div>
      </main>

      <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          智能思维导图 by DeepSeek AI
        </div>
      </footer>
    </div>
  );
}
