interface ParsedCode {
  html?: string;
  css?: string;
  javascript?: string;
}

export const parseCodeBlocks = (content: string): ParsedCode | null => {
  const result: ParsedCode = {};
  
  // Match code blocks with language identifiers
  const codeBlockRegex = /```(html|css|javascript)\n([\s\S]*?)\n```/g;
  let hasCode = false;
  
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [_, language, code] = match;
    hasCode = true;
    
    switch (language) {
      case 'html':
        result.html = code.trim();
        break;
      case 'css':
        result.css = code.trim();
        break;
      case 'javascript':
        result.javascript = code.trim();
        break;
    }
  }
  
  return hasCode ? result : null;
}; 