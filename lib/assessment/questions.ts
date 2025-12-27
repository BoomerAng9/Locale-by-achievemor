/**
 * V.I.B.E. Assessment Questions
 * Multi-step personality and cognitive assessment
 */

export interface AssessmentQuestion {
  id: string;
  section: 'verification' | 'intelligence' | 'behavioral' | 'evaluation';
  type: 'scale' | 'choice' | 'cognitive';
  question: string;
  options?: string[];
  correctAnswer?: number; // For cognitive questions
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // === VERIFICATION (5 questions) ===
  {
    id: 'v1',
    section: 'verification',
    type: 'choice',
    question: 'How many years of professional experience do you have in your field?',
    options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
  },
  {
    id: 'v2',
    section: 'verification',
    type: 'choice',
    question: 'What is your highest level of education or certification?',
    options: ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctoral/Professional'],
  },
  {
    id: 'v3',
    section: 'verification',
    type: 'scale',
    question: 'How confident are you in providing a portfolio of your past work?',
  },
  {
    id: 'v4',
    section: 'verification',
    type: 'scale',
    question: 'Are you comfortable with background verification?',
  },
  {
    id: 'v5',
    section: 'verification',
    type: 'scale',
    question: 'How often do you update your professional skills?',
  },

  // === INTELLIGENCE (5 cognitive questions) ===
  {
    id: 'i1',
    section: 'intelligence',
    type: 'cognitive',
    question: 'If a project takes 6 people 4 days to complete, how many days would it take 3 people?',
    options: ['6 days', '8 days', '12 days', '2 days'],
    correctAnswer: 1, // 8 days
  },
  {
    id: 'i2',
    section: 'intelligence',
    type: 'cognitive',
    question: 'Complete the pattern: 2, 6, 18, 54, ___',
    options: ['108', '162', '72', '81'],
    correctAnswer: 1, // 162
  },
  {
    id: 'i3',
    section: 'intelligence',
    type: 'cognitive',
    question: 'Which word does NOT belong: Efficient, Productive, Lazy, Effective',
    options: ['Efficient', 'Productive', 'Lazy', 'Effective'],
    correctAnswer: 2, // Lazy
  },
  {
    id: 'i4',
    section: 'intelligence',
    type: 'cognitive',
    question: 'A client needs a website in 2 weeks but your realistic estimate is 3 weeks. What do you do?',
    options: [
      'Promise 2 weeks anyway',
      'Communicate the realistic timeline with options',
      'Decline the project',
      'Start and hope for the best'
    ],
    correctAnswer: 1, // Communicate realistically
  },
  {
    id: 'i5',
    section: 'intelligence',
    type: 'cognitive',
    question: 'You discover a critical bug right before a deadline. What is the best approach?',
    options: [
      'Deploy anyway and fix later',
      'Inform stakeholders and assess severity',
      'Delay indefinitely until perfect',
      'Blame the previous developer'
    ],
    correctAnswer: 1, // Inform stakeholders
  },

  // === BEHAVIORAL (12 personality questions - DISC based) ===
  // Dominance questions
  {
    id: 'b1',
    section: 'behavioral',
    type: 'scale',
    question: 'I prefer to take charge and lead projects.',
  },
  {
    id: 'b2',
    section: 'behavioral',
    type: 'scale',
    question: 'I make decisions quickly and confidently.',
  },
  {
    id: 'b3',
    section: 'behavioral',
    type: 'scale',
    question: 'I am comfortable with confrontation and direct feedback.',
  },
  // Influence questions
  {
    id: 'b4',
    section: 'behavioral',
    type: 'scale',
    question: 'I enjoy meeting new people and networking.',
  },
  {
    id: 'b5',
    section: 'behavioral',
    type: 'scale',
    question: 'I express my ideas enthusiastically and openly.',
  },
  {
    id: 'b6',
    section: 'behavioral',
    type: 'scale',
    question: 'I prefer collaborative work environments.',
  },
  // Steadiness questions
  {
    id: 'b7',
    section: 'behavioral',
    type: 'scale',
    question: 'I am patient and prefer a steady work pace.',
  },
  {
    id: 'b8',
    section: 'behavioral',
    type: 'scale',
    question: 'I value stability and consistency in my work.',
  },
  {
    id: 'b9',
    section: 'behavioral',
    type: 'scale',
    question: 'I am a good listener and supportive team member.',
  },
  // Conscientiousness questions
  {
    id: 'b10',
    section: 'behavioral',
    type: 'scale',
    question: 'I pay close attention to details and accuracy.',
  },
  {
    id: 'b11',
    section: 'behavioral',
    type: 'scale',
    question: 'I prefer to analyze data before making decisions.',
  },
  {
    id: 'b12',
    section: 'behavioral',
    type: 'scale',
    question: 'I follow established processes and procedures.',
  },

  // === EVALUATION (5 questions) ===
  {
    id: 'e1',
    section: 'evaluation',
    type: 'scale',
    question: 'I consistently meet project deadlines.',
  },
  {
    id: 'e2',
    section: 'evaluation',
    type: 'scale',
    question: 'I actively seek feedback to improve my work.',
  },
  {
    id: 'e3',
    section: 'evaluation',
    type: 'scale',
    question: 'I communicate proactively with clients.',
  },
  {
    id: 'e4',
    section: 'evaluation',
    type: 'scale',
    question: 'I am responsive to messages within a reasonable timeframe.',
  },
  {
    id: 'e5',
    section: 'evaluation',
    type: 'scale',
    question: 'I maintain long-term professional relationships.',
  },
];

export const SECTION_INFO = {
  verification: {
    title: 'Verification',
    subtitle: 'Tell us about your professional background',
    icon: '✓',
    description: 'This section helps establish your credentials and experience level.',
  },
  intelligence: {
    title: 'Intelligence',
    subtitle: 'Problem-solving and critical thinking',
    icon: '🧠',
    description: 'Answer these questions to demonstrate your cognitive abilities.',
  },
  behavioral: {
    title: 'Behavioral',
    subtitle: 'Your work style and personality',
    icon: '💭',
    description: 'Rate each statement based on how well it describes you.',
  },
  evaluation: {
    title: 'Evaluation',
    subtitle: 'Professional habits and reliability',
    icon: '📊',
    description: 'Help us understand your work habits and client relationships.',
  },
};
