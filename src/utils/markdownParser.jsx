import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Regular expression to match bold, italic and combined markdown elements
const mdStyleRegex = /(\*\*\*(?=\S).+?(?<=\S)\*\*\*|\*\*(?=\S).+?(?<=\S)\*\*|\*[^\s*]+?(?<=\S)\*|\*(?=\S).+?(?<=\S)\*)/g;

export function parseMarkdownText(segment, isClozeMode = false, keyPrefix = "") {
  const parts = segment.split(mdStyleRegex);
  return parts.map((part, pIdx) => {
    if (pIdx % 2 === 0) {
      return part;
    }
    
    const key = `${keyPrefix}_${pIdx}`;
    
    if (part.startsWith('***') && part.endsWith('***')) {
      const content = part.slice(3, -3);
      if (isClozeMode) {
        return (
          <span 
            key={key} 
            className="cloze-concept blurred" 
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.classList.remove('blurred');
            }}
            title="Haz clic para revelar"
          >
            <strong><em>{content}</em></strong>
          </span>
        );
      }
      return <strong key={key}><em>{content}</em></strong>;
    }
    
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      if (isClozeMode) {
        return (
          <span 
            key={key} 
            className="cloze-concept blurred" 
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.classList.remove('blurred');
            }}
            title="Haz clic para revelar"
          >
            <strong>{content}</strong>
          </span>
        );
      }
      return <strong key={key}>{content}</strong>;
    }
    
    if (part.startsWith('*') && part.endsWith('*')) {
      const content = part.slice(1, -1);
      return <em key={key}>{content}</em>;
    }
    
    return part;
  });
}

export function restoreMathPlaceholders(nodes, mathItems) {
  if (!nodes) return null;
  
  const restoreInString = (str) => {
    if (typeof str !== 'string') return str;
    
    const parts = str.split(/(%%BLOCKMATH_\d+%%|%%INLINEMATH_\d+%%)/g);
    if (parts.length === 1) return str;
    
    return parts.map((part, idx) => {
      if (idx % 2 === 0) {
        return part;
      }
      const match = part.match(/%%(?:BLOCK|INLINE)MATH_(\d+)%%/);
      if (match) {
        const mathIndex = parseInt(match[1]);
        return mathItems[mathIndex]?.element || part;
      }
      return part;
    });
  };
  
  if (Array.isArray(nodes)) {
    const result = [];
    nodes.forEach((node, idx) => {
      if (typeof node === 'string') {
        const restored = restoreInString(node);
        if (Array.isArray(restored)) {
          result.push(...restored);
        } else {
          result.push(restored);
        }
      } else if (React.isValidElement(node)) {
        if (node.props && node.props.children) {
          const newChildren = restoreMathPlaceholders(node.props.children, mathItems);
          result.push(React.cloneElement(node, { key: node.key || idx }, newChildren));
        } else {
          result.push(node);
        }
      } else {
        result.push(node);
      }
    });
    return result;
  }
  
  if (typeof nodes === 'string') {
    return restoreInString(nodes);
  }
  
  if (React.isValidElement(nodes)) {
    if (nodes.props && nodes.props.children) {
      const newChildren = restoreMathPlaceholders(nodes.props.children, mathItems);
      return React.cloneElement(nodes, {}, newChildren);
    }
    return nodes;
  }
  
  return nodes;
}

export function renderTextWithMathAndMarkdown(text, isClozeMode = false, keyPrefix = "") {
  if (!text) return "";
  
  let isFootnote = false;
  let textToProcess = text;
  if (typeof text === 'string' && text.trim().startsWith('>')) {
    isFootnote = true;
    textToProcess = text.trim().replace(/^>\s*/, '');
  }

  const mathItems = [];
  
  // 1. Extract block math $$...$$ (ignoring escaped \$$)
  let processedText = textToProcess.replace(/(?<!\\)\$\$(.*?)(?<!\\)\$\$/gs, (_, mathContent) => {
    const placeholder = `%%BLOCKMATH_${mathItems.length}%%`;
    try {
      const html = katex.renderToString(mathContent, { displayMode: true, throwOnError: false });
      mathItems.push({
        type: 'block',
        element: <div key={placeholder} dangerouslySetInnerHTML={{ __html: html }} className="math-block" />
      });
    } catch {
      mathItems.push({
        type: 'block',
        element: <div key={placeholder} className="math-error">$$ {mathContent} $$</div>
      });
    }
    return placeholder;
  });
  
  // 2. Extract inline math $...$ (ignoring escaped \$ and requiring non-whitespace borders)
  processedText = processedText.replace(/(?<!\\)\$(?!\s)(.*?)(?<!\s)(?<!\\)\$/g, (_, mathContent) => {
    const placeholder = `%%INLINEMATH_${mathItems.length}%%`;
    try {
      const html = katex.renderToString(mathContent, { displayMode: false, throwOnError: false });
      mathItems.push({
        type: 'inline',
        element: <span key={placeholder} dangerouslySetInnerHTML={{ __html: html }} className="math-inline" />
      });
    } catch {
      mathItems.push({
        type: 'inline',
        element: <span key={placeholder} className="math-error">${mathContent}$</span>
      });
    }
    return placeholder;
  });

  // Unescape explicit dollar signs \$
  processedText = processedText.replace(/\\\$/g, '$');
  
  // 3. Parse markdown formatting
  const formattedElements = parseMarkdownText(processedText, isClozeMode, keyPrefix);
  
  // 4. Restore math elements
  const restored = restoreMathPlaceholders(formattedElements, mathItems);
  return isFootnote ? <span className="card-footnote">{restored}</span> : restored;
}

export function renderMathAndMarkdown(text) {
  return renderTextWithMathAndMarkdown(text, false, "math_md");
}

// Function to render slide body lines with list detection, nested list elements and KaTeX
export function renderSlideLines(content, blurConcepts = false) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  
  let currentList = null;
  let currentListType = null; // 'ul' or 'ol'
  
  const renderLineWithBlur = (text) => {
    if (!text) return "";
    if (!blurConcepts) {
      return renderMathAndMarkdown(text);
    }
    return renderTextWithMathAndMarkdown(text, true, "cloze");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList) {
        elements.push(currentList);
        currentList = null;
        currentListType = null;
      }
      continue;
    }
    
    // Check if it's a list item
    const isBullet = /^([*-])\s+/.test(trimmed);
    const isNumbered = /^\d+\.\s+/.test(trimmed);
    const isIndented = /^\s+/.test(line);
    
    if (isBullet || isNumbered) {
      const listType = isBullet ? 'ul' : 'ol';
      let cleanText = isBullet ? trimmed.substring(1).trim() : trimmed.replace(/^\d+\.\s+/, '').trim();
      
      const isFootnote = cleanText.startsWith('>');
      if (isFootnote) {
        cleanText = cleanText.replace(/^>\s*/, '');
      }

      if (currentListType !== listType || !currentList) {
        if (currentList) {
          elements.push(currentList);
        }
        currentListType = listType;
        currentList = { type: listType, items: [] };
      }
      
      currentList.items.push({
        text: cleanText,
        indented: isIndented,
        isFootnote: isFootnote,
        key: i
      });
    } else {
      if (currentList) {
        elements.push(currentList);
        currentList = null;
        currentListType = null;
      }
      
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        const math = trimmed.substring(2, trimmed.length - 2).trim();
        elements.push(
          <div key={i} className="math-block-line">
            {renderLineWithBlur(`$$${math}$$`)}
          </div>
        );
      } else if (trimmed.startsWith('>')) {
        const cleanText = trimmed.replace(/^>\s*/, '');
        elements.push(
          <p key={i} className="card-footnote">
            {renderLineWithBlur(cleanText)}
          </p>
        );
      } else {
        elements.push(
          <p key={i} className="text-line">
            {renderLineWithBlur(line)}
          </p>
        );
      }
    }
  }
  
  if (currentList) {
    elements.push(currentList);
  }
  
  return elements.map((el, idx) => {
    if (el.type === 'ul' || el.type === 'ol') {
      const Tag = el.type;
      const isShortList = el.items.length >= 5 && el.items.every(item => item.text.length < 55 && !item.indented);
      const listClassName = `content-list${isShortList ? " two-columns" : ""}`;
      return (
        <Tag key={`list-${idx}`} className={listClassName}>
          {el.items.map((item, itemIdx) => {
            const className = `${item.indented ? "nested-item" : "main-item"}${item.isFootnote ? " card-footnote" : ""}`;
            return (
              <li key={`item-${idx}-${itemIdx}`} className={className}>
                {renderLineWithBlur(item.text)}
              </li>
            );
          })}
        </Tag>
      );
    }
    if (React.isValidElement(el)) {
      return React.cloneElement(el, { key: `line-${idx}` });
    }
    return <React.Fragment key={`line-${idx}`}>{el}</React.Fragment>;
  });
}
