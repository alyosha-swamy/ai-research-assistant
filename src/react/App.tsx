"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { QueryForm } from "@/components/QueryForm";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ResponseViewer } from "@/components/ResponseViewer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useQueryHistory } from "@/hooks/useQueryHistory";
import type { ApiResponse, QueryHistory } from "@/types";
import { ThemeProvider } from "@/components/ThemeProvider";

export function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [model, setModel] = useState("sonar-deep-research");
  const [reasoning, setReasoning] = useState<"low" | "medium" | "high">("medium");
  const { history, addToHistory, clearHistory } = useQueryHistory();

  useEffect(() => {
    setSelectedHistoryId(null);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");
    setSelectedHistoryId(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, model, reasoning_effort: reasoning }),
      });
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
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header historyCount={history.length} onToggleHistory={() => setShowHistory(!showHistory)} />
        
        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Top Settings Bar */}
          <div className="flex items-center justify-between mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <option value="sonar-deep-research">Deep Research</option>
                  <option value="sonar-pro">Advanced</option>
                  <option value="sonar">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Effort</label>
                <select
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value as any)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick:</span>
              <button
                onClick={() => setQuery("What are the latest developments in AI?")}
                className="px-4 py-2 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
              >
                AI News
              </button>
              <button
                onClick={() => setQuery("Explain quantum computing in simple terms")}
                className="px-4 py-2 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/70 transition-colors"
              >
                Tech Explain
              </button>
              <button
                onClick={() => setQuery("What are the current market trends?")}
                className="px-4 py-2 text-xs font-medium bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/70 transition-colors"
              >
                Market
              </button>
            </div>
          </div>

          {/* Main Query Form */}
          <QueryForm query={query} loading={loading} onChange={setQuery} onSubmit={handleSubmit} />
          
          {/* Error Display */}
          {error && (
            <div className="mt-6">
              <ErrorAlert error={error} />
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mt-8">
              <ResponseViewer query={query} markdown={response} />
            </div>
          )}
          
          {/* Sidebar - moved to modal/drawer when needed */}
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
          
          {/* Welcome Message */}
          {!response && !error && !loading && (
            <div className="mt-16 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-12">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-4 w-16 h-16 mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Ready to Research</h3>
              <p className="text-gray-600 dark:text-gray-400 text-base max-w-lg mx-auto mb-8">
                Ask me anything and I'll conduct comprehensive research with detailed analysis and citations from reliable sources.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">Deep Research</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Comprehensive analysis across multiple sources</p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">Rich Citations</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Detailed sources and references included</p>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-sm">
                  <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">Export Ready</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">PDF and DOCX download options</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}


