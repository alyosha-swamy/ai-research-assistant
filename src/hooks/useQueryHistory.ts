"use client";

import { useEffect, useState } from "react";
import type { QueryHistory } from "@/types";

const STORAGE_KEY = "jina-query-history";

export function useQueryHistory() {
  const [history, setHistory] = useState<QueryHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Array<Omit<QueryHistory, "timestamp"> & { timestamp: string }>;
      setHistory(
        parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      );
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        history.map((item) => ({
          ...item,
          timestamp: item.timestamp.toISOString(),
        }))
      )
    );
  }, [history]);

  const addToHistory = (item: QueryHistory) => {
    setHistory((prev) => [item, ...prev.slice(0, 9)]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, setHistory, addToHistory, clearHistory } as const;
}


