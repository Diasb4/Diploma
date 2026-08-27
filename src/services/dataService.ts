export interface SchoolInfo {
  id: string;
  code: string;
  name: string;
  shortName: string;
}

export const schoolsList: SchoolInfo[] = [
  { id: 'ALL', code: 'ALL', name: 'Все школы', shortName: 'Все школы' },
  { id: 'SIS', code: 'SIS', name: 'Школа интеллектуальных систем', shortName: 'Интеллектуальные системы' },
  { id: 'SAIDS', code: 'SAIDS', name: 'Школа искусственного интеллекта и Data Science', shortName: 'ИИ и Data Science' },
  { id: 'SSE', code: 'SSE', name: 'Школа программной инженерии', shortName: 'Программная инженерия' },
  { id: 'SCY', code: 'SCY', name: 'Школа кибербезопасности', shortName: 'Кибербезопасность' },
  { id: 'SCI', code: 'SCI', name: 'Школа креативных индустрий', shortName: 'Креативные индустрии' },
  { id: 'SDPA', code: 'SDPA', name: 'Школа цифрового госуправления', shortName: 'Цифровое госуправление' },
  { id: 'SGED', code: 'SGED', name: 'Школа общеобразовательных дисциплин', shortName: 'Общеобразовательные дисциплины' }
];
