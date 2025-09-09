"use client";

import React from "react";
import type { QueryHistory } from "@/types";

interface SidebarProps {
  showHistory: boolean;
  history: QueryHistory[];
  selectedHistoryId: string | null;
  onClearHistory: () => void;
  onLoadFromHistory: (item: QueryHistory) => void;
  onTemplateSelect: (text: string) => void;
}

export function Sidebar({
  showHistory,
  history,
  selectedHistoryId,
  onClearHistory,
  onLoadFromHistory,
  onTemplateSelect,
}: SidebarProps) {
  return (
    <div className="sticky top-24 space-y-8">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h3 className="font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="space-y-4">
          <button
            onClick={() => onTemplateSelect("What are the latest developments in AI?")}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          >
            Latest AI News
          </button>
          <button
            onClick={() => onTemplateSelect("Explain quantum computing in simple terms")}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          >
            Tech Explanations
          </button>
          <button
            onClick={() => onTemplateSelect("What are the current market trends?")}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
          >
            Market Analysis
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Recent Queries</h3>
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onLoadFromHistory(item)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedHistoryId === item.id
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="text-sm font-medium truncate">{item.query}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.timestamp.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h3 className="font-semibold text-gray-900 mb-6">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Queries</span>
              <span className="font-medium">{history.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Tokens</span>
              <span className="font-medium">
                {history
                  .reduce((sum, item) => sum + (item.usage?.total_tokens || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


