"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ResponseViewer } from "@/components/ResponseViewer";
import { useQueryHistory } from "@/hooks/useQueryHistory";
import type { ApiResponse, QueryHistory } from "@/types";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "next-themes";

function AppContent() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [model, setModel] = useState("sonar-deep-research");
  const [reasoning, setReasoning] = useState<"low" | "medium" | "high">("medium");
  const { history, addToHistory, clearHistory } = useQueryHistory();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setSelectedHistoryId(null);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    console.log("Submitting query:", { query, model, reasoning_effort: reasoning });
    setLoading(true);
    setError("");
    setResponse("");
    setSelectedHistoryId(null);

    try {
      console.log("Making request to /api/chat");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, model, reasoning_effort: reasoning }),
      });
      console.log("Response received:", res.status, res.statusText);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to get response`);
      }
      const data: ApiResponse = await res.json();
      if (!data.response) {
        throw new Error("No response received from the AI service");
      }
      setResponse(data.response);
      addToHistory({
        id: Date.now().toString(),
        query,
        response: data.response,
        timestamp: new Date(),
        usage: data.usage,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process your request. Please try again.";
      setError(errorMessage);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: QueryHistory) => {
    setQuery(item.query);
    setResponse(item.response);
    setSelectedHistoryId(item.id);
    setError("");
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simple Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Research</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Simple Model Selector */}
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="sonar-deep-research">Deep Research</option>
              <option value="sonar-pro">Pro</option>
              <option value="sonar">Standard</option>
            </select>
            
            {/* History Button */}
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                History ({history.length})
              </button>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Welcome State */}
        {!response && !error && !loading && (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What would you like to research?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Ask any question and get comprehensive research with sources and citations.
            </p>
          </div>
        )}

        {/* Query Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
              placeholder="Ask anything... What would you like to research?"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                {/* Reasoning Effort */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Effort:</span>
                  <select
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value as any)}
                    className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={(e) => {
                  console.log("Button clicked!");
                  console.log("Form will submit with query:", query);
                }}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Researching...</span>
                  </div>
                ) : (
                  "Research"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <ResponseViewer query={query} markdown={response} />
          </div>
        )}
        
        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowHistory(false)} />
            <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Query History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Sidebar
                  showHistory={true}
                  history={history}
                  selectedHistoryId={selectedHistoryId}
                  onClearHistory={clearHistory}
                  onLoadFromHistory={loadFromHistory}
                  onTemplateSelect={(text) => setQuery(text)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
