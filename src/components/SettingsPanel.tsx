"use client";

import React from "react";

interface SettingsPanelProps {
  model: string;
  reasoning: "low" | "medium" | "high";
  onChange: (next: { model?: string; reasoning?: "low" | "medium" | "high" }) => void;
}

export function SettingsPanel({ model, reasoning, onChange }: SettingsPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <h3 className="font-semibold text-gray-900 mb-6">Settings</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Model</label>
          <select
            value={model}
            onChange={(e) => onChange({ model: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="jina-deepsearch-v1">jina-deepsearch-v1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Reasoning Effort</label>
          <select
            value={reasoning}
            onChange={(e) => onChange({ reasoning: e.target.value as any })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
}


