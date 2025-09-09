"use client";

import React from "react";

interface QueryFormProps {
  query: string;
  loading: boolean;
  onChange: (next: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function QueryForm({ query, loading, onChange, onSubmit }: QueryFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            What would you like to research?
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base bg-gray-50 dark:bg-gray-700 shadow-sm"
            rows={4}
            placeholder="Ask me anything... What would you like to research today?"
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">{query.length > 0 && `${query.length} characters`}</div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin"></div>
              <span>Researching...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Research</span>
            </div>
          )}
          </button>
        </div>
      </form>
    </div>
  );
}


