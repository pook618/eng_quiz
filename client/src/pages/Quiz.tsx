import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { sampleQuiz, calculateScore, QuizQuestion } from '@/lib/quizData';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

/**
 * Quiz Page Component
 * 
 * Design Philosophy: Warm Supportive Learning Environment
 * - Card-based layout with generous spacing
 * - Encouraging messaging and supportive tone
 * - Clear progress indicators
 * - Anti-cheat features integrated seamlessly
 */

interface QuizState {
  currentQuestion: number;
  answers: Record<number, number>;
  timeRemaining: number;
  isSubmitted: boolean;
  score?: number;
  percentage?: number;
  studentId?: string;
}

interface QuizActivity {
  activityType: string;
  timestamp: number;
  details?: string;
}

export default function Quiz() {
  // Student ID modal state
  const [showStudentIdModal, setShowStudentIdModal] = useState(true);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentId, setStudentId] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [activities, setActivities] = useState<QuizActivity[]>([]);

  // Activate anti-cheat features
  useAntiCheat();

  const quiz = sampleQuiz;
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    timeRemaining: (quiz.timeLimit || 30) * 60, // Convert to seconds
    isSubmitted: false,
  });

  // Submit quiz mutation
  const submitQuizMutation = trpc.quiz.submitQuiz.useMutation({
    onSuccess: (data) => {
      toast.success('Quiz submitted successfully! Email sent to instructor.');
    },
    onError: (error) => {
      toast.error('Failed to submit quiz: ' + (error.message || 'Unknown error'));
    },
  });

  // Track suspicious activities
  useEffect(() => {
    if (!quizStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setActivities((prev) => [...prev, {
          activityType: 'tab_switch',
          timestamp: Date.now(),
          details: 'Student switched to another tab',
        }]);
        toast.warning('Tab switch detected and logged');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [quizStarted]);

  // Timer effect
  useEffect(() => {
    if (quizState.isSubmitted || quizState.timeRemaining <= 0 || !quizStarted) return;

    const timer = setInterval(() => {
      setQuizState((prev) => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 300 && newTime % 60 === 0) {
          // Alert when 5 minutes remaining
          if (newTime === 300) {
            toast.warning('5 minutes remaining!');
          }
        }
        if (newTime <= 0) {
          toast.error('Time is up! Submitting your quiz...');
          return { ...prev, timeRemaining: 0, isSubmitted: true };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.isSubmitted, quizState.timeRemaining, quizStarted]);

  const handleStartQuiz = (id: string) => {
    if (!id.trim()) {
      toast.error('Please enter a valid student ID');
      return;
    }
    setStudentId(id);
    setShowStudentIdModal(false);
    setQuizStarted(true);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const currentQ = quiz.questions[quizState.currentQuestion];
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQ.id]: optionIndex,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion < quiz.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleSubmitQuiz = async () => {
    const result = calculateScore(quiz.questions, quizState.answers);
    setQuizState((prev) => ({
      ...prev,
      isSubmitted: true,
      score: result.correctCount,
      percentage: result.percentage,
    }));

    // Submit to backend
    try {
      await submitQuizMutation.mutateAsync({
        studentId: studentId,
        quizId: 'quiz-001',
        answers: quizState.answers,
        score: result.correctCount,
        percentage: result.percentage,
        totalQuestions: quiz.questions.length,
        activities: activities,
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const handleRetakeQuiz = () => {
    setShowStudentIdModal(true);
    setStudentIdInput('');
    setStudentId('');
    setQuizStarted(false);
    setActivities([]);
    setQuizState({
      currentQuestion: 0,
      answers: {},
      timeRemaining: (quiz.timeLimit || 30) * 60,
      isSubmitted: false,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[quizState.currentQuestion];
  const answeredCount = Object.keys(quizState.answers).length;
  const progressPercentage = (answeredCount / quiz.questions.length) * 100;

  // Student ID Modal
  if (showStudentIdModal) {
    return (
      <Dialog open={showStudentIdModal} onOpenChange={setShowStudentIdModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to the Quiz</DialogTitle>
            <DialogDescription>
              Please enter your student ID to begin the assessment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-id" className="text-base">Student ID</Label>
              <Input
                id="student-id"
                placeholder="Enter your student ID"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleStartQuiz(studentIdInput);
                  }
                }}
                className="text-base py-2"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> Your responses and activity will be tracked and logged for academic integrity purposes.
              </p>
            </div>
            <Button
              onClick={() => handleStartQuiz(studentIdInput)}
              className="w-full text-base py-2"
              disabled={!studentIdInput.trim()}
            >
              Start Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Results Screen
  if (quizState.isSubmitted) {
    const isPassing = quizState.percentage! >= 70;
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              {isPassing ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {isPassing ? "Congratulations! You passed!" : "Keep practicing to improve your score!"}
            </p>

            <div className="bg-card rounded-lg p-6 mb-8">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl font-bold text-primary">{quizState.score}/{quizState.percentage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-3xl font-bold text-primary">{quizState.percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`text-3xl font-bold ${isPassing ? 'text-green-500' : 'text-orange-500'}`}>
                    {isPassing ? 'Pass' : 'Retry'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your results have been submitted and an email with your answers and activity log has been sent to your instructor.
              </p>
              <Button
                onClick={handleRetakeQuiz}
                className="w-full text-base py-2"
              >
                Retake Quiz
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biology Quiz</h1>
            <p className="text-muted-foreground">Student ID: {studentId}</p>
          </div>
          <div className="flex items-center gap-2 bg-card rounded-lg px-4 py-2">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-lg font-semibold text-foreground">{formatTime(quizState.timeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Progress: {answeredCount} of {quiz.questions.length} answered</p>
            <p className="text-sm font-semibold text-primary">{Math.round(progressPercentage)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Question {quizState.currentQuestion + 1} of {quiz.questions.length}</p>
            <h2 className="text-2xl font-bold text-foreground">{currentQuestion.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  quizState.answers[currentQuestion.id] === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={quizState.answers[currentQuestion.id] === index}
                  onChange={() => handleSelectAnswer(index)}
                  className="w-4 h-4"
                />
                <span className="ml-3 text-foreground">{option}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Question Navigator */}
        <Card className="p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-4">Jump to question:</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setQuizState((prev) => ({ ...prev, currentQuestion: index }))}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  quizState.currentQuestion === index
                    ? 'bg-primary text-primary-foreground'
                    : quizState.answers[quiz.questions[index].id] !== undefined
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-card border border-border hover:border-primary'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestion === 0}
            variant="outline"
            className="flex-1"
          >
            Previous
          </Button>
          {quizState.currentQuestion < quiz.questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={submitQuizMutation.isPending}
            >
              {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
