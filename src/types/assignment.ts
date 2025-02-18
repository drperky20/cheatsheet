
export type GradeLevel = 'A' | 'B' | 'C';

export interface WritingFlaw {
  id: string;
  label: string;
  description: string;
  category: 'grammar' | 'content' | 'structure' | 'comprehension';
  severity: number; // 1-5, affects how much this flaw impacts the output
}

export interface AssignmentQualityConfig {
  targetGrade: GradeLevel;
  selectedFlaws: WritingFlaw[];
  writingStyle: 'formal' | 'casual' | 'mixed';
  confidenceLevel: number; // 1-100, how confident the responses should appear
}

export const AVAILABLE_FLAWS: WritingFlaw[] = [
  {
    id: 'spelling',
    label: 'Spelling Mistakes',
    description: 'Introduce common spelling errors in the text',
    category: 'grammar',
    severity: 2
  },
  {
    id: 'grammar',
    label: 'Grammar Issues',
    description: 'Add typical grammatical mistakes',
    category: 'grammar',
    severity: 2
  },
  {
    id: 'misread',
    label: 'Question Misinterpretation',
    description: 'Slightly misinterpret parts of the assignment prompt',
    category: 'comprehension',
    severity: 4
  },
  {
    id: 'structure',
    label: 'Poor Structure',
    description: 'Make the essay structure less organized',
    category: 'structure',
    severity: 3
  },
  {
    id: 'citation',
    label: 'Citation Errors',
    description: 'Include minor citation formatting mistakes',
    category: 'content',
    severity: 2
  },
  {
    id: 'informal',
    label: 'Informal Language',
    description: 'Use more casual/informal language',
    category: 'content',
    severity: 2
  },
  {
    id: 'repetitive',
    label: 'Repetitive Language',
    description: 'Repeat certain phrases or ideas',
    category: 'content',
    severity: 2
  },
  {
    id: 'shallow',
    label: 'Shallow Analysis',
    description: 'Provide surface-level analysis of topics',
    category: 'comprehension',
    severity: 3
  }
];
