/**
 * Advanced Deep Research Systems - Query Processor
 * BCSE497J Project-I: Improving Recursive Information Retrieval and Relevance Categorization
 * 
 * Intelligent query decomposition, expansion, and sub-question generation
 * Authors: Garvita Vaish (22BCE0832), Raghav R (22BCE0480)
 */

export interface QueryAnalysis {
  intent: QueryIntent;
  entities: Entity[];
  topics: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  domain: string;
  expectedAnswerType: 'factual' | 'analytical' | 'comparative' | 'procedural';
}

export interface QueryIntent {
  primary: string;
  secondary: string[];
  goals: string[];
  constraints: string[];
}

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'concept' | 'date' | 'other';
  confidence: number;
}

export interface ExpandedQuery {
  original: string;
  expansions: string[];
  synonyms: Map<string, string[]>;
  relatedTerms: string[];
  multilingual: Map<string, string>;
  domainSpecific: string[];
}

export interface SubQuestion {
  id: string;
  question: string;
  category: 'background' | 'definition' | 'evidence' | 'comparison' | 'implication';
  priority: number;
  dependencies: string[];
  expectedAnswerLength: 'short' | 'medium' | 'long';
}

/**
 * Intelligent Query Processor with NLP capabilities
 */
export class QueryProcessor {
  private stopWords: Set<string>;
  private domainKeywords: Map<string, string[]>;
  private synonymDict: Map<string, string[]>;

  constructor() {
    this.initializeNLPResources();
  }

  /**
   * Analyzes query intent and extracts structured information
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const normalized = this.normalizeQuery(query);
    
    const intent = await this.extractIntent(normalized);
    const entities = await this.extractEntities(normalized);
    const topics = await this.extractTopics(normalized);
    const complexity = this.assessComplexity(normalized, entities);
    const domain = this.identifyDomain(normalized, topics);
    const expectedAnswerType = this.determineAnswerType(normalized, intent);

    return {
      intent,
      entities,
      topics,
      complexity,
      domain,
      expectedAnswerType
    };
  }

  /**
   * Generates expanded queries with synonyms and related terms
   */
  async expandQuery(query: string, analysis?: QueryAnalysis): Promise<ExpandedQuery> {
    const normalized = this.normalizeQuery(query);
    const tokens = this.tokenize(normalized);
    
    const expansions: string[] = [];
    const synonyms = new Map<string, string[]>();
    const relatedTerms: string[] = [];
    const multilingual = new Map<string, string>();
    const domainSpecific: string[] = [];

    // Generate synonym-based expansions
    for (const token of tokens) {
      if (!this.stopWords.has(token.toLowerCase())) {
        const tokenSynonyms = this.getSynonyms(token);
        if (tokenSynonyms.length > 0) {
          synonyms.set(token, tokenSynonyms);
          
          // Create expanded queries
          for (const synonym of tokenSynonyms.slice(0, 3)) {
            const expandedQuery = normalized.replace(
              new RegExp(`\\b${token}\\b`, 'gi'), 
              synonym
            );
            expansions.push(expandedQuery);
          }
        }
      }
    }

    // Add contextual expansions
    if (analysis?.domain) {
      const domainTerms = this.domainKeywords.get(analysis.domain) || [];
      domainSpecific.push(...domainTerms.slice(0, 5));
      
      for (const term of domainSpecific.slice(0, 2)) {
        expansions.push(`${normalized} ${term}`);
      }
    }

    // Generate related term expansions
    relatedTerms.push(...this.generateRelatedTerms(tokens));
    
    for (const related of relatedTerms.slice(0, 3)) {
      expansions.push(`${normalized} ${related}`);
    }

    // Add question variations
    expansions.push(...this.generateQuestionVariations(normalized));

    return {
      original: query,
      expansions: [...new Set(expansions)].slice(0, 10), // Remove duplicates, limit to 10
      synonyms,
      relatedTerms,
      multilingual,
      domainSpecific
    };
  }

  /**
   * Generates intelligent sub-questions for comprehensive research
   */
  async generateSubQuestions(
    originalQuery: string, 
    analysis: QueryAnalysis,
    context?: any
  ): Promise<SubQuestion[]> {
    const subQuestions: SubQuestion[] = [];
    
    // Background questions
    if (analysis.entities.length > 0) {
      for (const entity of analysis.entities.slice(0, 3)) {
        subQuestions.push({
          id: `bg_${entity.text.replace(/\s+/g, '_').toLowerCase()}`,
          question: `What is ${entity.text}?`,
          category: 'background',
          priority: 0.8,
          dependencies: [],
          expectedAnswerLength: 'medium'
        });
      }
    }

    // Definition questions for complex topics
    if (analysis.complexity === 'complex') {
      const keyTerms = this.extractKeyTerms(originalQuery);
      for (const term of keyTerms.slice(0, 2)) {
        subQuestions.push({
          id: `def_${term.replace(/\s+/g, '_').toLowerCase()}`,
          question: `How is ${term} defined in ${analysis.domain}?`,
          category: 'definition',
          priority: 0.9,
          dependencies: [],
          expectedAnswerLength: 'short'
        });
      }
    }

    // Evidence-based questions
    subQuestions.push({
      id: 'evidence_main',
      question: `What evidence supports findings about ${this.extractMainTopic(originalQuery)}?`,
      category: 'evidence',
      priority: 0.95,
      dependencies: [],
      expectedAnswerLength: 'long'
    });

    // Comparative questions
    if (analysis.expectedAnswerType === 'comparative') {
      subQuestions.push({
        id: 'comparison_alternatives',
        question: `What are the alternatives to ${this.extractMainTopic(originalQuery)}?`,
        category: 'comparison',
        priority: 0.7,
        dependencies: ['evidence_main'],
        expectedAnswerLength: 'medium'
      });
    }

    // Implication questions
    subQuestions.push({
      id: 'implications',
      question: `What are the implications of ${this.extractMainTopic(originalQuery)}?`,
      category: 'implication',
      priority: 0.6,
      dependencies: ['evidence_main'],
      expectedAnswerLength: 'medium'
    });

    // Recent developments
    subQuestions.push({
      id: 'recent_developments',
      question: `What are the latest developments regarding ${this.extractMainTopic(originalQuery)}?`,
      category: 'evidence',
      priority: 0.85,
      dependencies: [],
      expectedAnswerLength: 'medium'
    });

    return subQuestions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Optimizes queries for different search engines and contexts
   */
  optimizeForSearchEngine(
    query: string, 
    engine: 'google' | 'bing' | 'academic' | 'news',
    analysis?: QueryAnalysis
  ): string[] {
    const optimized: string[] = [];
    
    switch (engine) {
      case 'google':
        // Google-specific optimizations
        optimized.push(query);
        optimized.push(`"${query}"`); // Exact phrase
        if (analysis?.entities.length) {
          optimized.push(`${query} ${analysis.entities[0].text}`);
        }
        break;
        
      case 'academic':
        // Academic search optimizations
        optimized.push(`${query} research study`);
        optimized.push(`${query} academic paper`);
        optimized.push(`${query} peer reviewed`);
        break;
        
      case 'news':
        // News-specific optimizations
        optimized.push(`${query} latest news`);
        optimized.push(`${query} recent developments`);
        optimized.push(`${query} 2024 OR 2025`);
        break;
        
      default:
        optimized.push(query);
    }
    
    return optimized;
  }

  /**
   * Removes near-duplicate queries using embedding-based clustering
   */
  async deduplicateQueries(queries: string[]): Promise<string[]> {
    if (queries.length <= 1) return queries;
    
    // Simplified deduplication using string similarity
    const unique: string[] = [];
    const seen = new Set<string>();
    
    for (const query of queries) {
      const normalized = this.normalizeQuery(query);
      let isDuplicate = false;
      
      for (const existing of seen) {
        if (this.calculateStringSimilarity(normalized, existing) > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        unique.push(query);
        seen.add(normalized);
      }
    }
    
    return unique;
  }

  /**
   * Ranks queries by expected information gain and relevance
   */
  rankQueries(
    queries: string[], 
    originalQuery: string,
    analysis?: QueryAnalysis
  ): { query: string; score: number; reasoning: string }[] {
    return queries.map(query => {
      let score = 0;
      let reasoning = '';
      
      // Base relevance to original query
      const relevance = this.calculateStringSimilarity(query, originalQuery);
      score += relevance * 0.4;
      reasoning += `Relevance: ${relevance.toFixed(2)} `;
      
      // Specificity bonus
      const specificity = this.calculateSpecificity(query);
      score += specificity * 0.3;
      reasoning += `Specificity: ${specificity.toFixed(2)} `;
      
      // Domain alignment bonus
      if (analysis?.domain) {
        const domainAlignment = this.calculateDomainAlignment(query, analysis.domain);
        score += domainAlignment * 0.2;
        reasoning += `Domain: ${domainAlignment.toFixed(2)} `;
      }
      
      // Freshness potential
      const freshnessPotential = this.calculateFreshnessPotential(query);
      score += freshnessPotential * 0.1;
      reasoning += `Freshness: ${freshnessPotential.toFixed(2)}`;
      
      return {
        query,
        score,
        reasoning
      };
    }).sort((a, b) => b.score - a.score);
  }

  // Private helper methods
  private initializeNLPResources(): void {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
    
    this.domainKeywords = new Map([
      ['technology', ['software', 'hardware', 'AI', 'machine learning', 'algorithms', 'programming']],
      ['science', ['research', 'study', 'experiment', 'hypothesis', 'methodology', 'peer review']],
      ['business', ['strategy', 'market', 'revenue', 'profit', 'competition', 'analysis']],
      ['health', ['medical', 'treatment', 'diagnosis', 'symptoms', 'healthcare', 'medicine']],
      ['education', ['learning', 'teaching', 'curriculum', 'pedagogy', 'assessment', 'academic']]
    ]);
    
    this.synonymDict = new Map([
      ['big', ['large', 'huge', 'massive', 'enormous']],
      ['small', ['tiny', 'little', 'miniature', 'compact']],
      ['fast', ['quick', 'rapid', 'swift', 'speedy']],
      ['good', ['excellent', 'great', 'outstanding', 'superb']],
      ['bad', ['poor', 'terrible', 'awful', 'horrible']]
    ]);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private tokenize(text: string): string[] {
    return text.split(/\s+/).filter(token => token.length > 0);
  }

  private async extractIntent(query: string): Promise<QueryIntent> {
    // Simplified intent extraction
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    const compareWords = ['compare', 'difference', 'versus', 'vs'];
    const analyzeWords = ['analyze', 'explain', 'describe', 'discuss'];
    
    let primary = 'information_seeking';
    const secondary: string[] = [];
    
    if (questionWords.some(word => query.includes(word))) {
      primary = 'question_answering';
    } else if (compareWords.some(word => query.includes(word))) {
      primary = 'comparison';
    } else if (analyzeWords.some(word => query.includes(word))) {
      primary = 'analysis';
    }
    
    return {
      primary,
      secondary,
      goals: ['comprehensive_understanding', 'accurate_information'],
      constraints: ['time_sensitive', 'factual_accuracy']
    };
  }

  private async extractEntities(query: string): Promise<Entity[]> {
    // Simplified entity extraction
    const entities: Entity[] = [];
    const words = this.tokenize(query);
    
    // Look for capitalized words (potential proper nouns)
    for (const word of words) {
      if (word.length > 2 && word[0] === word[0].toUpperCase()) {
        entities.push({
          text: word,
          type: 'other',
          confidence: 0.7
        });
      }
    }
    
    return entities;
  }

  private async extractTopics(query: string): Promise<string[]> {
    const words = this.tokenize(query);
    return words.filter(word => 
      !this.stopWords.has(word) && 
      word.length > 3
    ).slice(0, 5);
  }

  private assessComplexity(query: string, entities: Entity[]): 'simple' | 'moderate' | 'complex' {
    const words = this.tokenize(query);
    const complexWords = words.filter(word => word.length > 8).length;
    const entityCount = entities.length;
    
    if (words.length < 5 && complexWords === 0) return 'simple';
    if (words.length > 15 || complexWords > 3 || entityCount > 3) return 'complex';
    return 'moderate';
  }

  private identifyDomain(query: string, topics: string[]): string {
    for (const [domain, keywords] of this.domainKeywords.entries()) {
      if (keywords.some(keyword => 
        query.toLowerCase().includes(keyword) || 
        topics.some(topic => topic.includes(keyword))
      )) {
        return domain;
      }
    }
    return 'general';
  }

  private determineAnswerType(query: string, intent: QueryIntent): 'factual' | 'analytical' | 'comparative' | 'procedural' {
    if (intent.primary === 'comparison') return 'comparative';
    if (query.includes('how to') || query.includes('step')) return 'procedural';
    if (query.includes('analyze') || query.includes('why')) return 'analytical';
    return 'factual';
  }

  private getSynonyms(word: string): string[] {
    return this.synonymDict.get(word.toLowerCase()) || [];
  }

  private generateRelatedTerms(tokens: string[]): string[] {
    // Simplified related term generation
    const related: string[] = [];
    
    for (const token of tokens) {
      if (!this.stopWords.has(token.toLowerCase())) {
        related.push(`${token} definition`);
        related.push(`${token} examples`);
        related.push(`${token} applications`);
      }
    }
    
    return related.slice(0, 5);
  }

  private generateQuestionVariations(query: string): string[] {
    const variations: string[] = [];
    
    if (!query.toLowerCase().startsWith('what')) {
      variations.push(`What is ${query}?`);
    }
    if (!query.toLowerCase().startsWith('how')) {
      variations.push(`How does ${query} work?`);
    }
    if (!query.toLowerCase().startsWith('why')) {
      variations.push(`Why is ${query} important?`);
    }
    
    return variations;
  }

  private extractKeyTerms(query: string): string[] {
    const words = this.tokenize(query);
    return words.filter(word => 
      !this.stopWords.has(word.toLowerCase()) && 
      word.length > 4
    );
  }

  private extractMainTopic(query: string): string {
    const words = this.tokenize(query);
    const contentWords = words.filter(word => !this.stopWords.has(word.toLowerCase()));
    return contentWords.slice(0, 3).join(' ');
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity
    const set1 = new Set(this.tokenize(str1));
    const set2 = new Set(this.tokenize(str2));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculateSpecificity(query: string): number {
    const words = this.tokenize(query);
    const specificWords = words.filter(word => 
      !this.stopWords.has(word.toLowerCase()) && 
      word.length > 5
    ).length;
    
    return Math.min(specificWords / words.length, 1);
  }

  private calculateDomainAlignment(query: string, domain: string): number {
    const domainKeywords = this.domainKeywords.get(domain) || [];
    const queryWords = this.tokenize(query.toLowerCase());
    
    const matches = domainKeywords.filter(keyword => 
      queryWords.some(word => word.includes(keyword))
    ).length;
    
    return matches / Math.max(domainKeywords.length, 1);
  }

  private calculateFreshnessPotential(query: string): number {
    const timeWords = ['latest', 'recent', 'new', 'current', '2024', '2025'];
    const hasTimeWords = timeWords.some(word => query.toLowerCase().includes(word));
    return hasTimeWords ? 1.0 : 0.5;
  }
}
