'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

// Maximum characters allowed by DeepSeek API
const MAX_CHAR_LIMIT = 131072;

export default function FileUpload({ onFileUpload }) {
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const extractTextFromDocx = async (arrayBuffer) => {
    try {
      // 动态导入依赖项
      const JSZip = (await import('jszip')).default;
      const Docxtemplater = (await import('docxtemplater')).default;
      const { DOMParser } = await import('@xmldom/xmldom');
      
      // 创建一个新的JSZip实例
      const zip = new JSZip();
      
      // 加载docx文件内容
      await zip.loadAsync(arrayBuffer);
      
      // 创建一个新的docxtemplater实例
      const doc = new Docxtemplater();
      doc.loadZip(zip);
      
      // 获取document.xml文件内容
      const documentXml = await zip.file('word/document.xml').async('string');
      
      // 使用DOMParser解析XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
      
      // 提取文本节点
      const textNodes = [];
      const extractTextNodes = (node) => {
        if (node.nodeType === 3) { // 文本节点
          if (node.nodeValue.trim()) {
            textNodes.push(node.nodeValue);
          }
        } else if (node.nodeType === 1) { // 元素节点
          for (let i = 0; i < node.childNodes.length; i++) {
            extractTextNodes(node.childNodes[i]);
          }
        }
      };
      
      extractTextNodes(xmlDoc);
      
      // 组合所有文本
      return textNodes.join(' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      
      // 如果上面的方法失败，尝试使用简单方法
      try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        const loadedZip = await zip.loadAsync(arrayBuffer);
        const contentXml = await loadedZip.file('word/document.xml').async('text');
        
        // 简单方法提取文本
        const textContent = contentXml
          .replace(/<w:p[^>]*>/g, '\n')
          .replace(/<\/w:p>/g, '')
          .replace(/<[^>]*>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\n{2,}/g, '\n\n')
          .trim();
        
        return textContent;
      } catch (fallbackError) {
        console.error('Fallback method failed:', fallbackError);
        throw new Error('无法解析DOCX文件: ' + error.message);
      }
    }
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setError('');
    
    try {
      // 读取文件为ArrayBuffer
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
      
      let text = '';
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // 根据文件类型选择不同的解析方法
      if (fileExtension === 'docx') {
        text = await extractTextFromDocx(arrayBuffer);
      } else if (fileExtension === 'txt' || fileExtension === 'md') {
        // 纯文本文件直接读取
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else {
        throw new Error(`不支持的文件格式: ${fileExtension}`);
      }
      
      // 记录文本信息
      const textInfo = {
        length: text.length,
        byteLength: new Blob([text]).size,
        firstChars: text.substring(0, 100).replace(/[\r\n]+/g, ' ')
      };
      
      console.log('Extracted text info:', textInfo);
      setFileInfo(textInfo);
      
      // 检查字符数限制
      if (text.length > MAX_CHAR_LIMIT) {
        setError(`文本内容超过API限制（${MAX_CHAR_LIMIT}字符），提取文本长度：${text.length}字符`);
        setIsProcessing(false);
        return;
      }
      
      // 调用上传回调
      onFileUpload(text, file.name);
      setIsProcessing(false);
      
    } catch (err) {
      console.error('File processing error:', err);
      setError(`处理文件时出错: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setError('');
      setFileInfo(null);
      
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // 记录文件信息
        console.log(`File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
        
        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) { // 增加到10MB
          setError('文件过大，请上传小于10MB的文件');
          return;
        }
        
        await processFile(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-gray-400 dark:text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          <p className="text-lg font-medium">
            {isDragActive ? "拖放文件到这里" : "拖放文件到这里，或点击选择文件"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            支持 .txt, .md, .docx 格式（最大13万字符）
          </p>
        </div>
      </div>
      
      {/* PDF conversion button */}
      <button
        onClick={() => setShowPdfModal(true)}
        className="self-end text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
      >
        想上传PDF？
      </button>
      
      {/* PDF conversion modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PDF转换</h3>
              <button 
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="mb-4">由于此开源项目的限制，暂时无法直接处理PDF文件。您可以使用字节Doc2x平台进行免费PDF转换，只需简单一步即可轻松完成快速而精准的转换。 <a 
              href="https://doc2x.noedgeai.com?inviteCode=Q3ZK0E"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Doc2x平台
            </a></p>
            
          </div>
        </div>
      )}
      
      {isProcessing && (
        <div className="p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在处理文件，请稍候...
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {fileInfo && !error && !isProcessing && (
        <div className="p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm">
          文件已处理：{fileInfo.length} 字符 ({fileInfo.byteLength} 字节)
        </div>
      )}
    </div>
  );
} 