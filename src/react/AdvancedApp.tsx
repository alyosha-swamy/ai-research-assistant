/**
 * Advanced Deep Research Systems - Frontend Application
 * BCSE497J Project-I: Improving Recursive Information Retrieval and Relevance Categorization
 * 
 * Authors: Garvita Vaish (22BCE0832), Raghav R (22BCE0480)
 * Supervisor: Dr. Suganthini C, SCOPE, VIT University
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "next-themes";
import { DeepResearchOrchestrator, type ResearchSession } from "@/core/orchestrator";
import { QueryProcessor, type QueryAnalysis } from "@/core/queryProcessor";

interface ResearchState {
  session: ResearchSession | null;
  analysis: QueryAnalysis | null;
  currentIteration: number;
  totalIterations: number;
  status: string;
  progress: number;
  logs: ResearchLog[];
  finalReport: any;
}

interface ResearchLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'search' | 'reasoning' | 'synthesis' | 'error';
  message: string;
  details?: any;
}

function AdvancedAppContent() {
  const [query, setQuery] = useState("");
  const [researchState, setResearchState] = useState<ResearchState>({
    session: null,
    analysis: null,
    currentIteration: 0,
    totalIterations: 0,
    status: 'idle',
    progress: 0,
    logs: [],
    finalReport: null
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [researchConfig, setResearchConfig] = useState({
    maxTime: 300000, // 5 minutes
    maxIterations: 10,
    maxApiCalls: 50,
    maxTokens: 100000,
    enableDeepReasoning: true,
    includeComparativeAnalysis: true,
    generateSubQuestions: true
  });

  const orchestratorRef = useRef<DeepResearchOrchestrator | null>(null);
  const queryProcessorRef = useRef<QueryProcessor | null>(null);
  const { theme, setTheme } = useTheme();

  // Initialize core systems
  useEffect(() => {
    orchestratorRef.current = new DeepResearchOrchestrator();
    queryProcessorRef.current = new QueryProcessor();

    // Set up event listeners for research progress
    const orchestrator = orchestratorRef.current;
    
    orchestrator.on('sessionStarted', (data) => {
      addLog('info', `🚀 Research session started for: "${data.query}"`);
      setResearchState(prev => ({
        ...prev,
        status: 'initializing',
        progress: 5
      }));
    });

    orchestrator.on('iterationStarted', (data) => {
      addLog('search', `🔄 Starting iteration ${data.iteration}`);
      setResearchState(prev => ({
        ...prev,
        currentIteration: data.iteration,
        status: 'searching',
        progress: Math.min(20 + (data.iteration * 60) / prev.totalIterations, 80)
      }));
    });

    orchestrator.on('iterationCompleted', (data) => {
      addLog('reasoning', `✅ Iteration ${data.iteration} completed: ${data.factsDiscovered} facts discovered, ${data.newQuestions} new questions generated`);
    });

    orchestrator.on('sessionCompleted', (data) => {
      addLog('synthesis', `🎯 Research completed successfully`);
      setResearchState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        finalReport: data.report
      }));
    });

    orchestrator.on('sessionFailed', (data) => {
      addLog('error', `❌ Research failed: ${data.error}`);
      setResearchState(prev => ({
        ...prev,
        status: 'failed',
        progress: 0
      }));
    });

    return () => {
      // Cleanup
      orchestrator.removeAllListeners();
    };
  }, []);

  const addLog = useCallback((type: ResearchLog['type'], message: string, details?: any) => {
    const log: ResearchLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message,
      details
    };

    setResearchState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-50), log] // Keep last 50 logs
    }));
  }, []);

  const handleAdvancedResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !orchestratorRef.current || !queryProcessorRef.current) return;

    try {
      // Reset state
      setResearchState(prev => ({
        ...prev,
        session: null,
        analysis: null,
        currentIteration: 0,
        totalIterations: researchConfig.maxIterations,
        status: 'analyzing',
        progress: 0,
        logs: [],
        finalReport: null
      }));

      addLog('info', '🧠 Analyzing query complexity and intent...');

      // Analyze query
      const analysis = await queryProcessorRef.current.analyzeQuery(query);
      addLog('info', `📊 Query analysis complete: ${analysis.complexity} complexity, ${analysis.domain} domain`);

      setResearchState(prev => ({
        ...prev,
        analysis,
        progress: 10
      }));

      // Generate expanded queries and sub-questions
      const expandedQuery = await queryProcessorRef.current.expandQuery(query, analysis);
      const subQuestions = await queryProcessorRef.current.generateSubQuestions(query, analysis);

      addLog('info', `🔍 Generated ${expandedQuery.expansions.length} query expansions and ${subQuestions.length} sub-questions`);

      // Start deep research session
      const sessionId = await orchestratorRef.current.startResearchSession(query, {
        maxTime: researchConfig.maxTime,
        maxIterations: researchConfig.maxIterations,
        maxApiCalls: researchConfig.maxApiCalls,
        maxTokens: researchConfig.maxTokens
      });

      const session = orchestratorRef.current.getSession(sessionId);
      setResearchState(prev => ({
        ...prev,
        session,
        status: 'researching'
      }));

    } catch (error) {
      console.error('Advanced research failed:', error);
      addLog('error', `Failed to start research: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResearchState(prev => ({
        ...prev,
        status: 'failed'
      }));
    }
  };

  const stopResearch = async () => {
    if (researchState.session && orchestratorRef.current) {
      await orchestratorRef.current.stopSession(researchState.session.id);
      addLog('info', '⏹️ Research session stopped by user');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing': return '🧠';
      case 'searching': return '🔍';
      case 'reading': return '📖';
      case 'reasoning': return '💭';
      case 'synthesizing': return '📋';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Advanced Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Advanced Deep Research Systems
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  BCSE497J Project-I • Recursive Information Retrieval
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ⚙️ Config
              </button>
              
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Research Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Research Query Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <form onSubmit={handleAdvancedResearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Research Query
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    rows={4}
                    placeholder="Enter your research question for comprehensive analysis..."
                    disabled={researchState.status === 'researching'}
                  />
                </div>

                {/* Advanced Configuration Panel */}
                {showAdvancedOptions && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Advanced Configuration</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Iterations
                        </label>
                        <input
                          type="number"
                          value={researchConfig.maxIterations}
                          onChange={(e) => setResearchConfig(prev => ({
                            ...prev,
                            maxIterations: parseInt(e.target.value) || 10
                          }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          min="1"
                          max="20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Time (seconds)
                        </label>
                        <input
                          type="number"
                          value={researchConfig.maxTime / 1000}
                          onChange={(e) => setResearchConfig(prev => ({
                            ...prev,
                            maxTime: (parseInt(e.target.value) || 300) * 1000
                          }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          min="60"
                          max="1800"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={researchConfig.enableDeepReasoning}
                          onChange={(e) => setResearchConfig(prev => ({
                            ...prev,
                            enableDeepReasoning: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Deep Reasoning</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={researchConfig.generateSubQuestions}
                          onChange={(e) => setResearchConfig(prev => ({
                            ...prev,
                            generateSubQuestions: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sub-Questions</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {researchState.analysis && (
                      <span className="inline-flex items-center space-x-2">
                        <span>📊 {researchState.analysis.complexity} complexity</span>
                        <span>•</span>
                        <span>🏷️ {researchState.analysis.domain} domain</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {researchState.status === 'researching' && (
                      <button
                        type="button"
                        onClick={stopResearch}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        ⏹️ Stop
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={!query.trim() || researchState.status === 'researching'}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {researchState.status === 'researching' ? (
                        <span className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Researching...</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <span>🚀</span>
                          <span>Start Deep Research</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Progress and Status */}
            {researchState.status !== 'idle' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Research Progress
                  </h3>
                  <span className="text-2xl">{getStatusIcon(researchState.status)}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status: <span className="font-medium capitalize">{researchState.status}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {researchState.progress}% Complete
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${researchState.progress}%` }}
                    ></div>
                  </div>
                  
                  {researchState.session && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Iteration:</span>
                        <span className="ml-2 font-medium">{researchState.currentIteration} / {researchState.totalIterations}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Facts Found:</span>
                        <span className="ml-2 font-medium">{researchState.session.memory.discoveredFacts.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Display */}
            {researchState.finalReport && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Research Report
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h4>{researchState.finalReport.title}</h4>
                  <p><strong>Abstract:</strong> {researchState.finalReport.abstract}</p>
                  
                  <h5>Key Findings</h5>
                  <ul>
                    {researchState.finalReport.findings.core?.map((fact: any, index: number) => (
                      <li key={index}>{fact.content}</li>
                    ))}
                  </ul>
                  
                  <h5>Methodology</h5>
                  <p>{researchState.finalReport.methodology}</p>
                  
                  <h5>Research Metrics</h5>
                  <ul>
                    <li>Iterations: {researchState.finalReport.metadata.iterations}</li>
                    <li>Facts Discovered: {researchState.finalReport.metadata.factsDiscovered}</li>
                    <li>Sources Analyzed: {researchState.finalReport.metadata.sourcesAnalyzed}</li>
                    <li>Duration: {Math.round(researchState.finalReport.metadata.duration / 1000)}s</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Research Logs and Analytics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Research Logs
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {researchState.logs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                    No research activity yet. Start a research session to see live logs.
                  </p>
                ) : (
                  researchState.logs.slice(-20).reverse().map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg text-sm ${
                        log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                        log.type === 'search' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' :
                        log.type === 'reasoning' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                        log.type === 'synthesis' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200' :
                        'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="flex-1">{log.message}</span>
                        <span className="text-xs opacity-75 ml-2">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                System Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Framework:</span>
                  <span className="font-medium">DeepSearch + DeepResearch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Query Processing:</span>
                  <span className="font-medium">NLP + Embedding Analysis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Knowledge Storage:</span>
                  <span className="font-medium">Vector + Graph DB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Relevance Scoring:</span>
                  <span className="font-medium">Multi-dimensional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdvancedApp() {
  return (
    <ThemeProvider>
      <AdvancedAppContent />
    </ThemeProvider>
  );
}
