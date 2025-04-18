'use client';

import { useRef, useEffect, useState } from 'react';
import { Markmap } from 'markmap-view';
import { saveAs } from 'file-saver';
import { transformer } from './markmap';
import { Toolbar } from 'markmap-toolbar';
import { fillTemplate } from 'markmap-render';
import 'markmap-toolbar/dist/style.css';

export default function MindMap({ markdown, isVisible }) {
  const svgRef = useRef(null);
  const markmapRef = useRef(null);
  const toolbarRef = useRef(null);
  const [lastRenderedMarkdown, setLastRenderedMarkdown] = useState('');
  
  // Initialize markmap when component is mounted
  useEffect(() => {
    if (!svgRef.current || !isVisible) return;
    
    // Function to clean up the SVG completely
    const resetSvg = () => {
      if (svgRef.current) {
        // Clear all child elements from the SVG
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }
        
        // Reset any transforms or viewBox that might be causing issues
        svgRef.current.setAttribute('viewBox', '0 0 800 800');
        svgRef.current.style.transform = '';
      }
    };
    
    // Reset and recreate markmap instance for each render
    if (markdown && isVisible) {
      // Clean up previous instance if exists
      if (markmapRef.current) {
        // Destroy previous toolbar if it exists
        if (toolbarRef.current) {
          toolbarRef.current.innerHTML = '';
        }
        
        // Reset SVG before creating a new markmap
        resetSvg();
        
        // Nullify the reference so we create a new instance
        markmapRef.current = null;
      }
      
      // Create a fresh markmap instance
      markmapRef.current = Markmap.create(svgRef.current);
      
      // Add toolbar
      if (toolbarRef.current && typeof Toolbar !== 'undefined') {
        const toolbar = new Toolbar();
        toolbar.attach(markmapRef.current);
        toolbarRef.current.innerHTML = '';
        toolbarRef.current.append(toolbar.render());
      }
      
      try {
        // Transform and set the data
        const { root } = transformer.transform(markdown);
        markmapRef.current.setData(root).then(() => {
          markmapRef.current.fit();
          setLastRenderedMarkdown(markdown);
        });
      } catch (error) {
        console.error("Error rendering markmap:", error);
      }
    }
    
    // Clean up on component unmount
    return () => {
      if (toolbarRef.current) {
        toolbarRef.current.innerHTML = '';
      }
    };
  }, [markdown, isVisible]);

  const exportAsHtml = () => {
    if (!markmapRef.current || !svgRef.current) return;
    
    // Transform markdown to markmap data
    const { root } = transformer.transform(markdown);
    
    // Get assets from transformer
    const assets = transformer.getAssets();
    
    // Extra options for template
    const extra = {
      title: '智能思维导图导出',
      scripts: [
        // Extra scripts if needed
      ],
      styles: [
        // Extra CSS if needed
        'body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }',
        '.markmap-container { width: 100%; height: 100vh; }'
      ],
    };
    
    // Generate HTML using fillTemplate
    const html = fillTemplate(root, assets, extra);
    
    // Create and download file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    saveAs(blob, 'smart-markmap-export.html');
  };

  const exportAsMarkdown = () => {
    if (!markdown) return;
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, 'smart-markmap-export.md');
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {isVisible && (
        <>
          <div className="flex justify-end gap-2">
            <button
              onClick={exportAsHtml}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              导出 HTML
            </button>
            <button
              onClick={exportAsMarkdown}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              导出 Markdown
            </button>
          </div>
          <div className="relative w-full min-h-[800px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <svg 
              ref={svgRef} 
              className="w-full h-[800px]"
            ></svg>
            <div 
              ref={toolbarRef} 
              className="absolute bottom-4 right-4"
            ></div>
          </div>
        </>
      )}
    </div>
  );
} 