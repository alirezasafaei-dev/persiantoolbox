'use client';

import { createElement, memo, type ReactNode } from 'react';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

type Node = {
  type: string;
  value?: string;
  children?: Node[];
  depth?: number;
  ordered?: boolean;
  start?: number;
  url?: string;
  alt?: string;
  lang?: string;
};
const parser = remark().use(remarkGfm);

function safeLink(url = ''): string | null {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

function ChatMarkdown({ text, onCopy }: { text: string; onCopy: (text: string) => void }) {
  function render(node: Node, key: number): ReactNode {
    const children = node.children?.map(render);
    switch (node.type) {
      case 'text':
        return node.value;
      case 'paragraph':
        return (
          <p key={key} dir="auto">
            {children}
          </p>
        );
      case 'heading':
        return createElement(
          `h${Math.min(6, Math.max(2, node.depth ?? 2))}`,
          { key, dir: 'auto' },
          children,
        );
      case 'strong':
        return <strong key={key}>{children}</strong>;
      case 'emphasis':
        return <em key={key}>{children}</em>;
      case 'delete':
        return <del key={key}>{children}</del>;
      case 'list':
        return node.ordered ? (
          <ol key={key} start={node.start}>
            {children}
          </ol>
        ) : (
          <ul key={key}>{children}</ul>
        );
      case 'listItem':
        return <li key={key}>{children}</li>;
      case 'blockquote':
        return <blockquote key={key}>{children}</blockquote>;
      case 'inlineCode':
        return (
          <code key={key} dir="ltr">
            {node.value}
          </code>
        );
      case 'code':
        return (
          <div key={key} className="ai-code">
            <div className="ai-code-bar">
              <span dir="ltr">{node.lang?.slice(0, 30) ?? 'کد'}</span>
              <button type="button" onClick={() => onCopy(node.value ?? '')}>
                کپی کد
              </button>
            </div>
            <pre dir="ltr" tabIndex={0}>
              <code>{node.value}</code>
            </pre>
          </div>
        );
      case 'link': {
        const href = safeLink(node.url);
        return href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ) : (
          <span key={key}>{children}</span>
        );
      }
      case 'image':
        return <span key={key}>{node.alt}</span>;
      case 'html':
        return <span key={key}>{node.value}</span>;
      case 'break':
        return <br key={key} />;
      case 'thematicBreak':
        return <hr key={key} />;
      case 'table':
        return (
          <div key={key} className="ai-table" tabIndex={0}>
            <table>
              <tbody>{children}</tbody>
            </table>
          </div>
        );
      case 'tableRow':
        return <tr key={key}>{children}</tr>;
      case 'tableCell':
        return <td key={key}>{children}</td>;
      default:
        return <span key={key}>{children}</span>;
    }
  }
  const tree = parser.parse(text.slice(0, 20_000)) as Node;
  return (
    <div className="ai-markdown" dir="auto">
      {tree.children?.map(render)}
    </div>
  );
}

export default memo(ChatMarkdown);
