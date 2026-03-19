/**
 * Quiz Data Structure
 * 
 * Design Philosophy: Warm Supportive Learning Environment
 * - Questions are clear and well-formatted
 * - Multiple choice options are balanced
 * - Sample quiz demonstrates various question types
 */

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizSession {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
}

// Sample quiz data
export const sampleQuiz: QuizSession = {
  id: 'quiz-001',
  title: 'Introduction to Biology',
  description: 'Test your knowledge of basic biological concepts',
  timeLimit: 30,
  passingScore: 70,
  questions: [
    {
      id: 1,
      question: 'What is the basic unit of life?',
      options: ['Atom', 'Cell', 'Molecule', 'Tissue'],
      correctAnswer: 1,
      explanation: 'The cell is the smallest unit of life and is considered the basic building block of all living organisms.',
    },
    {
      id: 2,
      question: 'Which organelle is responsible for energy production in a cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
      correctAnswer: 1,
      explanation: 'Mitochondria are often called the "powerhouses" of the cell because they produce ATP (adenosine triphosphate), which is the energy currency of the cell.',
    },
    {
      id: 3,
      question: 'What is the process by which plants make their own food?',
      options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'],
      correctAnswer: 1,
      explanation: 'Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.',
    },
    {
      id: 4,
      question: 'Which of the following is NOT a characteristic of living organisms?',
      options: ['Growth', 'Reproduction', 'Fixed shape and size', 'Response to environment'],
      correctAnswer: 2,
      explanation: 'Living organisms do not have fixed shapes and sizes—they grow, adapt, and change throughout their lives.',
    },
    {
      id: 5,
      question: 'What is the function of the ribosome?',
      options: ['Store genetic information', 'Produce proteins', 'Break down waste', 'Transport molecules'],
      correctAnswer: 1,
      explanation: 'Ribosomes are the sites of protein synthesis in the cell. They read mRNA and translate it into proteins.',
    },
    {
      id: 6,
      question: 'Which type of blood cell is responsible for fighting infections?',
      options: ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma cells'],
      correctAnswer: 1,
      explanation: 'White blood cells (leukocytes) are part of the immune system and help protect the body from infections and diseases.',
    },
    {
      id: 7,
      question: 'What is the primary function of the heart?',
      options: ['Filter blood', 'Pump blood', 'Produce oxygen', 'Store nutrients'],
      correctAnswer: 1,
      explanation: 'The heart is a muscular organ that pumps blood throughout the body, delivering oxygen and nutrients to all cells.',
    },
    {
      id: 8,
      question: 'Which of the following is a prokaryote?',
      options: ['Plant cell', 'Animal cell', 'Bacteria', 'Fungal cell'],
      correctAnswer: 2,
      explanation: 'Bacteria are prokaryotes, meaning they lack a membrane-bound nucleus and other organelles. All other options are eukaryotes.',
    },
  ],
};

// Helper function to get a quiz by ID
export function getQuizById(id: string): QuizSession | null {
  if (id === 'quiz-001') {
    return sampleQuiz;
  }
  return null;
}

// Helper function to calculate score
export function calculateScore(
  questions: QuizQuestion[],
  answers: Record<number, number>
): { score: number; percentage: number; correctCount: number } {
  let correctCount = 0;
  
  questions.forEach((question) => {
    if (answers[question.id] === question.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  
  return {
    score: correctCount,
    percentage,
    correctCount,
  };
}
