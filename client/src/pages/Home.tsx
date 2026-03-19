import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { BookOpen, Shield, Clock, CheckCircle } from 'lucide-react';

/**
 * Home Page Component
 * 
 * Design Philosophy: Warm Supportive Learning Environment
 * - Welcoming landing page with clear call-to-action
 * - Features highlight the supportive nature of the platform
 * - Encouraging messaging for students
 */

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Quiz Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Secure Assessment Platform
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Welcome to Your Quiz
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take your assessment in a secure, supportive environment. We're here to help you succeed with clear questions and fair evaluation.
            </p>
          </div>

          <Button
            onClick={() => navigate('/quiz')}
            className="quiz-button text-lg px-8 py-6 mb-12"
          >
            Start Quiz
          </Button>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="quiz-card p-6 text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure Environment</h3>
              <p className="text-sm text-muted-foreground">
                Protected assessment with anti-cheat measures to ensure fair evaluation.
              </p>
            </Card>

            <Card className="quiz-card p-6 text-left">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Time Management</h3>
              <p className="text-sm text-muted-foreground">
                Clear timer and progress tracking to help you manage your time effectively.
              </p>
            </Card>

            <Card className="quiz-card p-6 text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Get your score and detailed results immediately after completing the quiz.
              </p>
            </Card>

            <Card className="quiz-card p-6 text-left">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Learn & Improve</h3>
              <p className="text-sm text-muted-foreground">
                Review your answers and understand explanations to improve your knowledge.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="bg-card py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Quiz Guidelines
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Before You Start</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Find a quiet place with no distractions</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Ensure you have a stable internet connection</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Close all other applications and tabs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Have all necessary materials ready (if allowed)</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">During the Quiz</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>Read each question carefully before answering</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>You can navigate between questions freely</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>Keep the quiz window active at all times</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>Submit your quiz before time runs out</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 px-4 text-center text-muted-foreground">
        <p>© 2026 Quiz Portal. All rights reserved. Secure Assessment Platform.</p>
      </footer>
    </div>
  );
}
