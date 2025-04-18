import { NextResponse } from 'next/server';

// Maximum characters allowed by DeepSeek API
const MAX_CHAR_LIMIT = 131072;

export async function POST(request) {
  try {
    const { text, apiKey, apiEndpoint, modelId } = await request.json();
    
    if (!text || !apiKey || !apiEndpoint) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Log detailed text information for debugging
    console.log(`API received text: length=${text.length}, byteLength=${new Blob([text]).size}`);
    
    // Check if text appears to be binary/non-text content
    const hasBinaryContent = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text.substring(0, 1000));
    if (hasBinaryContent) {
      console.log("Warning: Text appears to contain binary data. This may be a binary file incorrectly read as text.");
    }

    // Check text length before proceeding
    if (text.length > MAX_CHAR_LIMIT) {
      console.log(`Text exceeds limit: ${text.length} > ${MAX_CHAR_LIMIT}`);
      return NextResponse.json(
        { error: `Input length ${text.length} exceeds the maximum length ${MAX_CHAR_LIMIT}` },
        { status: 400 }
      );
    }

    // Use the provided modelId or default to deepseek-chat-v3
    const model = modelId || 'deepseek-chat-v3';

    const prompt = `
目标：
* 帮助用户将文件整理成结构化的文档，使其更加清晰易读。
* 使用 markmap 语法创建思维导图，以便更好地呈现文档结构。
* 在整理过程中，尽量保留原文的表述方式，不进行额外的解释或修改。
* 确保不遗漏原文中的任何细节信息。

行为准则：
1. 分析文本内容，识别其逻辑结构和层次关系。
2. 生成的思维导图应清晰地展示文档的各个部分及其相互联系。
3. 在生成 markmap 代码时，严格遵循 markmap 的语法规则。
4. 最终以 markdown 文本形式输出生成的 markmap 代码。
5. 在整个过程中，避免对原文内容进行任何形式的改动或删减。
6. markmap示例代码为：
"---
title: markmap
---

## Links

- [Website](https://markmap.js.org/)
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap) for Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) for VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) for Emacs

## Features

Note that if blocks and lists appear at the same level, the lists will be ignored.

### Lists

- **strong** ~~del~~ *italic* ==highlight==
- \`inline code\`
- [x] checkbox
- Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text based on \`maxWidth\` option
- Ordered list
  1. item 1
  2. item 2

### Blocks

\`\`\`js
console.log('hello, JavaScript')
\`\`\`

| Products | Price |
|-|-|
| Apple | 4 |
| Banana | 2 |

![](https://markmap.js.org/favicon.png)"

语气：
* 清晰、简洁地呈现整理结果。
* 避免使用主观性或推测性的语言。

以下是需要整理的文本：

${text}
`;

    // Create and return a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the API request in the background
    const fetchPromise = fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: true // Enable streaming
      })
    });

    // Process the streaming response
    fetchPromise.then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Failed to generate mind map';
        writer.write(encoder.encode(JSON.stringify({ error: errorMessage })));
        writer.close();
        return;
      }

      if (!response.body) {
        writer.write(encoder.encode(JSON.stringify({ error: 'No response body received' })));
        writer.close();
        return;
      }

      const reader = response.body.getReader();
      let markdownContent = '';
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the received chunk
          buffer += new TextDecoder().decode(value, { stream: true });
          
          // Process the buffer to extract complete JSON objects
          let boundary = buffer.indexOf('\n');
          while (boundary !== -1) {
            const chunk = buffer.substring(0, boundary).trim();
            buffer = buffer.substring(boundary + 1);
            
            if (chunk.startsWith('data: ')) {
              const data = chunk.replace(/^data: /, '');
              
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  markdownContent += content;
                  
                  // Send accumulated content to client
                  writer.write(encoder.encode(JSON.stringify({ 
                    chunk: content,
                    markdown: markdownContent 
                  }) + '\n'));
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
            
            boundary = buffer.indexOf('\n');
          }
        }
        
        // Clean up the markdown content by removing markdown code block delimiters
        let cleanedMarkdown = markdownContent;
        
        // Remove ```markdown at the beginning if present
        if (cleanedMarkdown.startsWith('```markdown')) {
          cleanedMarkdown = cleanedMarkdown.substring('```markdown'.length);
        } else if (cleanedMarkdown.startsWith('```')) {
          cleanedMarkdown = cleanedMarkdown.substring('```'.length);
        }
        
        // Remove ``` at the end if present
        if (cleanedMarkdown.endsWith('```')) {
          cleanedMarkdown = cleanedMarkdown.substring(0, cleanedMarkdown.length - 3);
        }
        
        // Trim any extra whitespace
        cleanedMarkdown = cleanedMarkdown.trim();
        
        // Send the final cleaned markdown
        writer.write(encoder.encode(JSON.stringify({ 
          done: true,
          markdown: cleanedMarkdown 
        }) + '\n'));
      } catch (error) {
        writer.write(encoder.encode(JSON.stringify({ error: error.message || 'Error processing stream' })));
      } finally {
        writer.close();
      }
    }).catch(error => {
      writer.write(encoder.encode(JSON.stringify({ error: error.message || 'Error fetching response' })));
      writer.close();
    });

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error generating mind map:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 