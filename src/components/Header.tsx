"use client";

import React from "react";
import { useTheme } from "next-themes";

interface HeaderProps {
  historyCount: number;
  onToggleHistory: () => void;
}

export function Header({ historyCount, onToggleHistory }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Research Assistant</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Research Tool</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleHistory}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History ({historyCount})</span>
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm6.364 2.636a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM21 11a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1zM6.757 6.343a1 1 0 0 1 1.414 0l.707.707A1 1 0 0 1 7.464 8.464l-.707-.707a1 1 0 0 1 0-1.414zM12 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm7.071-4.243a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM4 11a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1zm2.929 6.071a1 1 0 1 1 1.414 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.64 13a9 9 0 1 1-10.63-10.63 1 1 0 0 1 1.11.27 1 1 0 0 1 .18 1.12A7 7 0 1 0 20 12.36a1 1 0 0 1 1.38-.93 1 1 0 0 1 .26 1.57z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


