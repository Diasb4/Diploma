import { Topic } from '../types.js';

const STOPWORDS = new Set([
  'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она', 'так',
  'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне', 'было',
  'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда', 'даже', 'ну', 'вдруг',
  'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до', 'вас', 'нибудь', 'опять', 'уж',
  'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей', 'может', 'они', 'тут', 'где', 'есть',
  'надо', 'ней', 'для', 'мы', 'тебя', 'их', 'чем', 'была', 'сам', 'чтоб', 'без', 'будто', 'чего',
  'раз', 'тоже', 'себе', 'под', 'будет', 'ж', 'тогда', 'кто', 'этот', 'того', 'потому', 'этого',
  'какой', 'совсем', 'ним', 'здесь', 'этом', 'один', 'почти', 'мой', 'тем', 'чтобы', 'нее', 'сейчас',
  'были', 'куда', 'зачем', 'всех', 'никогда', 'можно', 'при', 'наконец', 'два', 'об', 'другой',
  'хоть', 'после', 'над', 'больше', 'тот', 'через', 'эти', 'нас', 'про', 'всего', 'них', 'какая',
  'много', 'разве', 'три', 'эту', 'моя', 'впрочем', 'хорошо', 'свою', 'этой', 'перед', 'иногда',
  'лучше', 'чуть', 'том', 'нельзя', 'такой', 'им', 'более', 'всегда', 'конечно', 'всю', 'между',
  'разработка', 'создание', 'исследование', 'применение', 'использование', 'система', 'системе',
  'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'using',
  'based', 'development', 'system', 'application', 'study', 'analysis', 'design'
]);

export interface SimilarityResult {
  score: number; // 0 to 100
  verdict: 'SAFE' | 'WARNING' | 'DUPLICATE';
  message: string;
  matchedKeywords: string[];
  matchedTopics: Array<{
    topicId: string;
    topicCode: string;
    title: string;
    school: string;
    supervisorName: string;
    similarity: number;
    commonTerms: string[];
  }>;
  suggestions: string[];
}

export class TopicSimilarityEngine {
  /**
   * Tokenize text, remove punctuation, numbers, and stopwords
   */
  private tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, ' ')
      .split(/\s+/)
      .map(t => t.trim())
      .filter(t => t.length > 2 && !STOPWORDS.has(t));
  }

  /**
   * Extract character n-grams for fuzzy sub-word matching
   */
  private getNGrams(tokens: string[], n = 2): Set<string> {
    const ngrams = new Set<string>();
    for (const token of tokens) {
      if (token.length < n) {
        ngrams.add(token);
        continue;
      }
      for (let i = 0; i <= token.length - n; i++) {
        ngrams.add(token.substring(i, i + n));
      }
    }
    return ngrams;
  }

  /**
   * Calculate Cosine Similarity based on Term Frequencies
   */
  private cosineSimilarity(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    const freqA: Record<string, number> = {};
    const freqB: Record<string, number> = {};

    tokensA.forEach(t => freqA[t] = (freqA[t] || 0) + 1);
    tokensB.forEach(t => freqB[t] = (freqB[t] || 0) + 1);

    const allKeys = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key of allKeys) {
      const valA = freqA[key] || 0;
      const valB = freqB[key] || 0;
      dotProduct += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate Jaccard Similarity on n-grams for semantic fuzzy overlap
   */
  private nGramJaccard(tokensA: string[], tokensB: string[]): number {
    const setA = this.getNGrams(tokensA, 3);
    const setB = this.getNGrams(tokensB, 3);

    if (setA.size === 0 || setB.size === 0) return 0;

    let intersectionCount = 0;
    for (const item of setA) {
      if (setB.has(item)) intersectionCount++;
    }

    const unionCount = setA.size + setB.size - intersectionCount;
    return unionCount === 0 ? 0 : intersectionCount / unionCount;
  }

  /**
   * Check a candidate topic title and description against all existing topics
   */
  public checkTopicSimilarity(
    candidateTitle: string,
    candidateDescription: string,
    existingTopics: Topic[]
  ): SimilarityResult {
    const candidateText = `${candidateTitle} ${candidateDescription}`;
    const candidateTokens = this.tokenize(candidateText);
    const candidateTitleTokens = this.tokenize(candidateTitle);

    if (candidateTokens.length === 0) {
      return {
        score: 0,
        verdict: 'SAFE',
        message: 'Недостаточно данных для анализа сходства.',
        matchedKeywords: [],
        matchedTopics: [],
        suggestions: ['Опишите тему и цели проекта более развернуто.']
      };
    }

    const matchedList: Array<{
      topicId: string;
      topicCode: string;
      title: string;
      school: string;
      supervisorName: string;
      similarity: number;
      commonTerms: string[];
    }> = [];

    const allOverlapKeywords = new Set<string>();

    for (const topic of existingTopics) {
      const targetText = `${topic.title} ${topic.description} ${topic.techStack?.join(' ')} ${topic.track}`;
      const targetTokens = this.tokenize(targetText);
      const targetTitleTokens = this.tokenize(topic.title);

      // Cosine on full text
      const fullCosine = this.cosineSimilarity(candidateTokens, targetTokens);
      // Cosine on titles only (gives high weight to similar titles)
      const titleCosine = this.cosineSimilarity(candidateTitleTokens, targetTitleTokens);
      // N-gram Jaccard on full text
      const nGramScore = this.nGramJaccard(candidateTokens, targetTokens);

      // Weighted score: if titles are strongly overlapping, title cosine dominates
      const combinedScore = Math.min(1, Math.max(titleCosine * 0.75 + fullCosine * 0.25, titleCosine * 0.5 + fullCosine * 0.3 + nGramScore * 0.2));
      const percentage = Math.round(combinedScore * 100);

      // Find common significant keywords
      const common = candidateTokens.filter(t => targetTokens.includes(t));
      const uniqueCommon = Array.from(new Set(common));

      if (percentage >= 20 || uniqueCommon.length >= 2) {
        uniqueCommon.forEach(k => allOverlapKeywords.add(k));
        matchedList.push({
          topicId: topic.id,
          topicCode: topic.code,
          title: topic.title,
          school: topic.school,
          supervisorName: topic.supervisorName,
          similarity: percentage,
          commonTerms: uniqueCommon.slice(0, 6)
        });
      }
    }

    // Sort by similarity descending
    matchedList.sort((a, b) => b.similarity - a.similarity);

    const highestScore = matchedList.length > 0 ? matchedList[0].similarity : 0;
    let verdict: 'SAFE' | 'WARNING' | 'DUPLICATE' = 'SAFE';
    let message = 'Тема оригинальна. Критических совпадений в базе AITU не обнаружено.';
    const suggestions: string[] = [];

    if (highestScore >= 70) {
      verdict = 'DUPLICATE';
      message = `Высокая степень совпадения (${highestScore}%). Тема очень похожа на существующую дипломную работу.`;
      suggestions.push('Сфокусируйтесь на узкой прикладной задаче (например, конкретной архитектуре или датасете).');
      suggestions.push('Добавьте уникальный стек технологий или специфическую предметную область (FinTech, HealthTech, Smart Campus).');
      suggestions.push('Сформулируйте научную новизну и отличие от существующих аналогов.');
    } else if (highestScore >= 40) {
      verdict = 'WARNING';
      message = `Умеренное пересечение (${highestScore}%). Рекомендуется уточнить методологию и ожидаемые результаты.`;
      suggestions.push('Уточните архитектуру решения и ключевые метрики эффективности.');
      suggestions.push('Обсудите с научным руководителем акцент исследования для исключения схожести.');
    } else {
      suggestions.push('Тема готова к подаче на утверждение в выпускающую школу.');
      suggestions.push('Убедитесь, что стек технологий соответствует компетенциям команды.');
    }

    return {
      score: highestScore,
      verdict,
      message,
      matchedKeywords: Array.from(allOverlapKeywords).slice(0, 10),
      matchedTopics: matchedList.slice(0, 5),
      suggestions
    };
  }
}

export const similarityEngine = new TopicSimilarityEngine();
