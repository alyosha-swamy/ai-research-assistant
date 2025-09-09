"use client";

import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { exportElementToPDF, exportMarkdownToDocx } from "@/utils/exporters";

interface ResponseViewerProps {
  query: string;
  markdown: string;
  sources?: string[];
}

export function ResponseViewer({ query, markdown, sources }: ResponseViewerProps) {
  const markdownRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!markdownRef.current) return;
    await exportElementToPDF(markdownRef.current);
  };

  const handleExportDocx = async () => {
    await exportMarkdownToDocx(markdown, query);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Research Results</h2>
              <p className="text-sm text-gray-600">Generated with Jina DeepSearch</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportDocx}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>DOCX</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-start space-x-3">
          <div className="bg-slate-200 rounded-full p-1 mt-0.5">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Your Query</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{query}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div
          ref={markdownRef}
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-800"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {markdown}
          </ReactMarkdown>
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Sources</h4>
            <ul className="list-disc list-inside space-y-1">
              {sources.map((src) => (
                <li key={src}>
                  <a className="text-blue-600 hover:underline" href={src} target="_blank" rel="noreferrer">
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


