"use client";

import React from "react";

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Something went wrong</h3>
          <p className="text-sm text-red-700">{error}</p>
          {error.includes("quota exceeded") && (
            <div className="mt-4 p-4 bg-red-100 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-2">💡 Solution: Enable demo mode to test all features</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs">
                <p className="text-gray-300">Stop the server (Ctrl+C) and run:</p>
                <p className="mt-1">
                  <span className="text-white">DEMO_MODE=true</span> npm run dev
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


