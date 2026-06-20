'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { searchTools } from '@/lib/tool-search';
import type { ToolEntry } from '@/lib/tools-registry';

export default function ToolSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ToolEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    const found = searchTools(undefined, value);
    setResults(found);
    setIsOpen(true);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) {
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function getCategoryLabel(tool: ToolEntry): string {
    return tool.category?.name ?? '';
  }

  return (
    <div ref={containerRef} className="tool-search-container">
      <div className="tool-search-wrapper">
        <svg
          className="tool-search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => doSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="دنبال چه ابزاری می‌گردید؟ مثلاً ادغام PDF، محاسبه وام، فشرده‌سازی عکس"
          className="tool-search-input"
          aria-label="جستجوی ابزار"
          aria-autocomplete="list"
          aria-controls="tool-search-listbox"
          aria-expanded={isOpen}
          aria-activedescendant={activeIndex >= 0 ? `tool-search-option-${activeIndex}` : undefined}
          role="combobox"
        />
        {query && (
          <button
            type="button"
            className="tool-search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="پاک کردن جستجو"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul
          id="tool-search-listbox"
          className="tool-search-results"
          role="listbox"
          aria-label="نتایج جستجو"
        >
          {results.map((tool, index) => (
            <li
              id={`tool-search-option-${index}`}
              key={tool.id}
              role="option"
              aria-selected={index === activeIndex}
            >
              <Link
                href={tool.path}
                className={`tool-search-result ${index === activeIndex ? 'active' : ''}`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                <span className="tool-search-result-title">
                  {tool.title.replace(/ - جعبه ابزار فارسی/g, '')}
                </span>
                {getCategoryLabel(tool) && (
                  <span className="tool-search-result-category">{getCategoryLabel(tool)}</span>
                )}
                <span className="tool-search-result-desc">{tool.description.slice(0, 80)}...</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div className="tool-search-empty" role="status">
          <p>ابزاری پیدا نشد. نام ابزار یا دسته‌بندی را ساده‌تر بنویسید.</p>
        </div>
      )}
    </div>
  );
}
