/**
 * Advanced Deep Research Systems - Relevance and Credibility Engine
 * BCSE497J Project-I: Improving Recursive Information Retrieval and Relevance Categorization
 * 
 * Multi-dimensional relevance scoring with bias detection and credibility assessment
 * Authors: Garvita Vaish (22BCE0832), Raghav R (22BCE0480)
 */

import { RetrievedDocument } from './retrievalSystem';

export interface RelevanceScore {
  overall: number;
  semantic: number;
  topical: number;
  temporal: number;
  credibility: number;
  quality: number;
  bias: BiasScore;
  explanation: string;
  category: 'core' | 'peripheral' | 'irrelevant' | 'contradictory';
}

export interface BiasScore {
  overall: number;
  political: number;
  commercial: number;
  demographic: number;
  confirmation: number;
  indicators: string[];
  severity: 'low' | 'moderate' | 'high';
}

export interface ContentQualityMetrics {
  readability: number;
  coherence: number;
  factualDensity: number;
  citationQuality: number;
  expertise: number;
  objectivity: number;
}

export interface CredibilityAssessment {
  score: number;
  factors: CredibilityFactors;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface CredibilityFactors {
  authorExpertise: number;
  domainAuthority: number;
  sourceTransparency: number;
  factualAccuracy: number;
  recentness: number;
  peerValidation: number;
  methodology: number;
}

export interface RelevanceContext {
  originalQuery: string;
  researchGoals: string[];
  domainContext: string;
  previousFindings: string[];
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  preferredSources: string[];
  excludedDomains: string[];
  biasThreshold: number;
  recencyWeight: number;
  academicPreference: number;
}

/**
 * Advanced relevance and credibility assessment engine
 */
export class RelevanceEngine {
  private stopWords: Set<string>;
  private biasKeywords: Map<string, string[]>;
  private credibilitySignals: Map<string, number>;
  private domainReputations: Map<string, number>;

  constructor() {
    this.initializeNLPResources();
    this.initializeBiasDetection();
    this.initializeCredibilitySignals();
    this.initializeDomainReputations();
  }

  /**
   * Comprehensive relevance scoring for a document
   */
  async scoreRelevance(
    document: RetrievedDocument,
    context: RelevanceContext
  ): Promise<RelevanceScore> {
    // Calculate individual relevance dimensions
    const semantic = await this.calculateSemanticRelevance(document, context);
    const topical = await this.calculateTopicalRelevance(document, context);
    const temporal = await this.calculateTemporalRelevance(document, context);
    const credibility = await this.assessCredibility(document);
    const quality = await this.assessContentQuality(document);
    const bias = await this.detectBias(document);

    // Apply weighted scoring algorithm
    const weights = this.getRelevanceWeights(context);
    const overall = this.calculateOverallRelevance({
      semantic,
      topical,
      temporal,
      credibility: credibility.score,
      quality: quality.coherence,
      bias: 1 - bias.overall // Invert bias (less bias = more relevant)
    }, weights);

    // Categorize relevance
    const category = this.categorizeRelevance(overall, semantic, bias);

    // Generate explanation
    const explanation = this.generateRelevanceExplanation({
      overall,
      semantic,
      topical,
      temporal,
      credibility: credibility.score,
      quality: quality.coherence,
      bias,
      category
    });

    return {
      overall,
      semantic,
      topical,
      temporal,
      credibility: credibility.score,
      quality: quality.coherence,
      bias,
      explanation,
      category
    };
  }

  /**
   * Calculate semantic similarity between document and query
   */
  private async calculateSemanticRelevance(
    document: RetrievedDocument,
    context: RelevanceContext
  ): Promise<number> {
    // Simplified semantic similarity calculation
    // In production, this would use embedding models (BERT, Sentence-BERT, etc.)
    
    const queryTerms = this.extractKeyTerms(context.originalQuery);
    const documentTerms = this.extractKeyTerms(document.content + ' ' + document.title);
    
    // Calculate term overlap
    const overlap = this.calculateTermOverlap(queryTerms, documentTerms);
    
    // Calculate TF-IDF similarity (simplified)
    const tfidfSimilarity = this.calculateTFIDFSimilarity(queryTerms, documentTerms);
    
    // Combine scores
    const semanticScore = (overlap * 0.3) + (tfidfSimilarity * 0.7);
    
    // Boost for exact phrase matches
    const exactMatches = this.findExactMatches(context.originalQuery, document.content);
    const phraseBoost = exactMatches.length * 0.1;
    
    return Math.min(semanticScore + phraseBoost, 1.0);
  }

  /**
   * Calculate topical relevance
   */
  private async calculateTopicalRelevance(
    document: RetrievedDocument,
    context: RelevanceContext
  ): Promise<number> {
    let relevance = 0.5; // Base score
    
    // Domain alignment
    const domainAlignment = this.calculateDomainAlignment(document, context.domainContext);
    relevance += domainAlignment * 0.3;
    
    // Goal alignment
    const goalAlignment = this.calculateGoalAlignment(document, context.researchGoals);
    relevance += goalAlignment * 0.4;
    
    // Content depth
    const depthScore = this.assessContentDepth(document);
    relevance += depthScore * 0.3;
    
    return Math.min(relevance, 1.0);
  }

  /**
   * Calculate temporal relevance (recency, timeliness)
   */
  private async calculateTemporalRelevance(
    document: RetrievedDocument,
    context: RelevanceContext
  ): Promise<number> {
    const now = new Date();
    const publishDate = document.metadata.publishedDate || document.extractedAt;
    const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Recency scoring with decay
    let recencyScore = 1.0;
    if (ageInDays > 30) {
      recencyScore = Math.exp(-ageInDays / 365); // Exponential decay over year
    }
    
    // Context-specific temporal adjustments
    if (context.domainContext === 'technology' || context.domainContext === 'news') {
      recencyScore *= 1.2; // Higher weight for recent content in fast-moving fields
    }
    
    // Check for temporal keywords
    const temporalKeywords = ['latest', 'recent', 'new', 'current', '2024', '2025'];
    const hasTemporalKeywords = temporalKeywords.some(keyword => 
      context.originalQuery.toLowerCase().includes(keyword)
    );
    
    if (hasTemporalKeywords) {
      recencyScore *= 1.3;
    }
    
    return Math.min(recencyScore, 1.0);
  }

  /**
   * Comprehensive credibility assessment
   */
  private async assessCredibility(document: RetrievedDocument): Promise<CredibilityAssessment> {
    const factors: CredibilityFactors = {
      authorExpertise: this.assessAuthorExpertise(document),
      domainAuthority: this.getDomainAuthority(document.metadata.domain),
      sourceTransparency: this.assessSourceTransparency(document),
      factualAccuracy: this.estimateFactualAccuracy(document),
      recentness: this.calculateRecencyScore(document),
      peerValidation: this.assessPeerValidation(document),
      methodology: this.assessMethodology(document)
    };

    // Weighted credibility score
    const score = (
      factors.authorExpertise * 0.2 +
      factors.domainAuthority * 0.25 +
      factors.sourceTransparency * 0.15 +
      factors.factualAccuracy * 0.2 +
      factors.recentness * 0.1 +
      factors.peerValidation * 0.05 +
      factors.methodology * 0.05
    );

    const riskLevel = score > 0.7 ? 'low' : score > 0.4 ? 'medium' : 'high';
    
    const recommendations = this.generateCredibilityRecommendations(factors, riskLevel);

    return {
      score,
      factors,
      riskLevel,
      recommendations
    };
  }

  /**
   * Advanced bias detection
   */
  private async detectBias(document: RetrievedDocument): Promise<BiasScore> {
    const political = this.detectPoliticalBias(document);
    const commercial = this.detectCommercialBias(document);
    const demographic = this.detectDemographicBias(document);
    const confirmation = this.detectConfirmationBias(document);
    
    const overall = (political + commercial + demographic + confirmation) / 4;
    
    const indicators = this.identifyBiasIndicators(document, {
      political,
      commercial,
      demographic,
      confirmation
    });
    
    const severity = overall > 0.7 ? 'high' : overall > 0.4 ? 'moderate' : 'low';

    return {
      overall,
      political,
      commercial,
      demographic,
      confirmation,
      indicators,
      severity
    };
  }

  /**
   * Content quality assessment
   */
  private async assessContentQuality(document: RetrievedDocument): Promise<ContentQualityMetrics> {
    return {
      readability: this.calculateReadability(document.content),
      coherence: this.assessCoherence(document.content),
      factualDensity: this.calculateFactualDensity(document.content),
      citationQuality: this.assessCitationQuality(document.content),
      expertise: this.assessExpertiseLevel(document),
      objectivity: this.assessObjectivity(document.content)
    };
  }

  // Bias detection methods
  private detectPoliticalBias(document: RetrievedDocument): number {
    const politicalKeywords = this.biasKeywords.get('political') || [];
    const content = document.content.toLowerCase();
    
    let biasScore = 0;
    let matches = 0;
    
    for (const keyword of politicalKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const keywordMatches = (content.match(regex) || []).length;
      if (keywordMatches > 0) {
        matches += keywordMatches;
        biasScore += keywordMatches * 0.1;
      }
    }
    
    // Normalize by document length
    const normalizedScore = biasScore / (document.content.length / 1000);
    
    return Math.min(normalizedScore, 1.0);
  }

  private detectCommercialBias(document: RetrievedDocument): number {
    const commercialKeywords = ['buy', 'purchase', 'sale', 'discount', 'promotion', 'ad', 'sponsored'];
    const content = document.content.toLowerCase();
    
    let commercialSignals = 0;
    
    for (const keyword of commercialKeywords) {
      if (content.includes(keyword)) {
        commercialSignals++;
      }
    }
    
    // Check URL for commercial indicators
    const url = document.url.toLowerCase();
    if (url.includes('shop') || url.includes('store') || url.includes('buy')) {
      commercialSignals += 2;
    }
    
    return Math.min(commercialSignals / 10, 1.0);
  }

  private detectDemographicBias(document: RetrievedDocument): number {
    const biasTerms = ['always', 'never', 'all', 'none', 'every', 'typical', 'stereotypical'];
    const content = document.content.toLowerCase();
    
    let biasScore = 0;
    
    for (const term of biasTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = (content.match(regex) || []).length;
      biasScore += matches * 0.05;
    }
    
    return Math.min(biasScore, 1.0);
  }

  private detectConfirmationBias(document: RetrievedDocument): number {
    const absoluteTerms = ['obviously', 'clearly', 'undoubtedly', 'certainly', 'definitely'];
    const content = document.content.toLowerCase();
    
    let absolutismScore = 0;
    
    for (const term of absoluteTerms) {
      if (content.includes(term)) {
        absolutismScore += 0.1;
      }
    }
    
    // Check for lack of alternative viewpoints
    const balanceTerms = ['however', 'although', 'on the other hand', 'alternatively'];
    const hasBalance = balanceTerms.some(term => content.includes(term));
    
    if (!hasBalance && content.length > 1000) {
      absolutismScore += 0.2;
    }
    
    return Math.min(absolutismScore, 1.0);
  }

  // Quality assessment methods
  private calculateReadability(content: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = this.countSyllables(content);
    
    if (sentences === 0 || words === 0) return 0;
    
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Convert to 0-1 scale
    return Math.max(0, Math.min(fleschScore / 100, 1));
  }

  private assessCoherence(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 2) return 0.5;
    
    let coherenceScore = 0.5;
    
    // Check for transition words
    const transitions = ['however', 'therefore', 'furthermore', 'moreover', 'consequently'];
    const hasTransitions = transitions.some(t => content.toLowerCase().includes(t));
    if (hasTransitions) coherenceScore += 0.2;
    
    // Check for consistent terminology
    const keyTerms = this.extractKeyTerms(content);
    const termConsistency = this.checkTermConsistency(content, keyTerms);
    coherenceScore += termConsistency * 0.3;
    
    return Math.min(coherenceScore, 1.0);
  }

  private calculateFactualDensity(content: string): number {
    // Count factual indicators
    const factualPatterns = [
      /\d+%/g, // Percentages
      /\d{4}/g, // Years
      /\$\d+/g, // Dollar amounts
      /\d+\.\d+/g, // Decimal numbers
      /according to/gi,
      /study shows/gi,
      /research indicates/gi
    ];
    
    let factualCount = 0;
    for (const pattern of factualPatterns) {
      const matches = content.match(pattern);
      if (matches) factualCount += matches.length;
    }
    
    const wordCount = content.split(/\s+/).length;
    return Math.min(factualCount / (wordCount / 100), 1.0);
  }

  // Helper methods
  private extractKeyTerms(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return words
      .filter(word => !this.stopWords.has(word) && word.length > 3)
      .slice(0, 20); // Top 20 terms
  }

  private calculateTermOverlap(terms1: string[], terms2: string[]): number {
    const set1 = new Set(terms1);
    const set2 = new Set(terms2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateTFIDFSimilarity(terms1: string[], terms2: string[]): number {
    // Simplified TF-IDF similarity
    const commonTerms = terms1.filter(term => terms2.includes(term));
    return commonTerms.length / Math.max(terms1.length, terms2.length);
  }

  private findExactMatches(query: string, content: string): string[] {
    const phrases = query.split(/[,;.]/).map(p => p.trim()).filter(p => p.length > 3);
    return phrases.filter(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    );
  }

  private categorizeRelevance(
    overall: number,
    semantic: number,
    bias: BiasScore
  ): 'core' | 'peripheral' | 'irrelevant' | 'contradictory' {
    if (bias.overall > 0.8) return 'contradictory';
    if (overall > 0.7 && semantic > 0.6) return 'core';
    if (overall > 0.4) return 'peripheral';
    return 'irrelevant';
  }

  private generateRelevanceExplanation(scores: any): string {
    const parts: string[] = [];
    
    if (scores.semantic > 0.7) {
      parts.push('High semantic similarity to query');
    } else if (scores.semantic > 0.4) {
      parts.push('Moderate semantic relevance');
    } else {
      parts.push('Low semantic relevance');
    }
    
    if (scores.credibility > 0.7) {
      parts.push('high credibility source');
    } else if (scores.credibility > 0.4) {
      parts.push('moderate credibility');
    } else {
      parts.push('low credibility source');
    }
    
    if (scores.bias.overall > 0.6) {
      parts.push(`potential ${scores.bias.severity} bias detected`);
    }
    
    return parts.join(', ') + '.';
  }

  // Initialization methods
  private initializeNLPResources(): void {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);
  }

  private initializeBiasDetection(): void {
    this.biasKeywords = new Map([
      ['political', ['liberal', 'conservative', 'democrat', 'republican', 'left-wing', 'right-wing']],
      ['commercial', ['buy', 'purchase', 'sale', 'discount', 'promotion', 'sponsored']],
      ['demographic', ['typical', 'stereotypical', 'always', 'never', 'all', 'none']]
    ]);
  }

  private initializeCredibilitySignals(): void {
    this.credibilitySignals = new Map([
      ['peer-reviewed', 0.9],
      ['academic', 0.8],
      ['research', 0.7],
      ['study', 0.7],
      ['expert', 0.6],
      ['analysis', 0.5]
    ]);
  }

  private initializeDomainReputations(): void {
    this.domainReputations = new Map([
      ['wikipedia.org', 0.8],
      ['arxiv.org', 0.95],
      ['pubmed.ncbi.nlm.nih.gov', 0.95],
      ['scholar.google.com', 0.9],
      ['nature.com', 0.95],
      ['science.org', 0.95]
    ]);
  }

  private getRelevanceWeights(context: RelevanceContext): any {
    return {
      semantic: 0.3,
      topical: 0.25,
      temporal: context.userPreferences?.recencyWeight || 0.15,
      credibility: 0.2,
      quality: 0.1
    };
  }

  private calculateOverallRelevance(scores: any, weights: any): number {
    return (
      scores.semantic * weights.semantic +
      scores.topical * weights.topical +
      scores.temporal * weights.temporal +
      scores.credibility * weights.credibility +
      scores.quality * weights.quality
    );
  }

  // Placeholder implementations for complex methods
  private calculateDomainAlignment(document: RetrievedDocument, domain: string): number {
    return 0.5; // Simplified
  }

  private calculateGoalAlignment(document: RetrievedDocument, goals: string[]): number {
    return 0.5; // Simplified
  }

  private assessContentDepth(document: RetrievedDocument): number {
    return Math.min(document.content.length / 5000, 1.0);
  }

  private assessAuthorExpertise(document: RetrievedDocument): number {
    return document.metadata.credibilityIndicators?.expertiseSignals?.length > 0 ? 0.7 : 0.3;
  }

  private getDomainAuthority(domain: string): number {
    return this.domainReputations.get(domain) || 0.5;
  }

  private assessSourceTransparency(document: RetrievedDocument): number {
    return document.metadata.credibilityIndicators?.hasContactInfo ? 0.8 : 0.4;
  }

  private estimateFactualAccuracy(document: RetrievedDocument): number {
    return document.metadata.credibilityIndicators?.hasCitations ? 0.8 : 0.5;
  }

  private calculateRecencyScore(document: RetrievedDocument): number {
    const ageInDays = (Date.now() - document.extractedAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-ageInDays / 365);
  }

  private assessPeerValidation(document: RetrievedDocument): number {
    return document.source === 'academic' ? 0.9 : 0.3;
  }

  private assessMethodology(document: RetrievedDocument): number {
    const methodKeywords = ['methodology', 'method', 'approach', 'analysis'];
    const hasMethod = methodKeywords.some(k => document.content.toLowerCase().includes(k));
    return hasMethod ? 0.7 : 0.3;
  }

  private generateCredibilityRecommendations(factors: CredibilityFactors, risk: string): string[] {
    const recommendations: string[] = [];
    
    if (factors.authorExpertise < 0.5) {
      recommendations.push('Verify author credentials and expertise');
    }
    if (factors.factualAccuracy < 0.6) {
      recommendations.push('Cross-reference claims with additional sources');
    }
    if (risk === 'high') {
      recommendations.push('Use with caution and seek corroborating evidence');
    }
    
    return recommendations;
  }

  private identifyBiasIndicators(document: RetrievedDocument, biasScores: any): string[] {
    const indicators: string[] = [];
    
    if (biasScores.political > 0.5) indicators.push('Political language detected');
    if (biasScores.commercial > 0.5) indicators.push('Commercial intent identified');
    if (biasScores.demographic > 0.5) indicators.push('Demographic generalizations found');
    if (biasScores.confirmation > 0.5) indicators.push('Absolutist language detected');
    
    return indicators;
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting
    return text.toLowerCase().replace(/[^a-z]/g, '').length / 3;
  }

  private checkTermConsistency(content: string, keyTerms: string[]): number {
    // Simplified consistency check
    return 0.7;
  }

  private assessCitationQuality(content: string): number {
    const citationCount = (content.match(/\[\d+\]|\(\d{4}\)/g) || []).length;
    return Math.min(citationCount / 10, 1.0);
  }

  private assessExpertiseLevel(document: RetrievedDocument): number {
    return document.metadata.credibilityIndicators?.expertiseSignals?.length > 0 ? 0.8 : 0.4;
  }

  private assessObjectivity(content: string): number {
    const subjectiveWords = ['amazing', 'terrible', 'best', 'worst', 'incredible'];
    const subjectiveCount = subjectiveWords.reduce((count, word) => {
      return count + (content.toLowerCase().split(word).length - 1);
    }, 0);
    
    return Math.max(0, 1 - (subjectiveCount / (content.length / 1000)));
  }
}
