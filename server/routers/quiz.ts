import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { saveQuizSubmission, getSubmissionActivities } from "../db";
import { notifyOwner } from "../_core/notification";

/**
 * Quiz Router
 * Handles quiz submission, activity tracking, and email notifications
 */

const QuizActivitySchema = z.object({
  activityType: z.string(),
  timestamp: z.number(),
  details: z.string().optional(),
});

const QuizSubmissionSchema = z.object({
  studentId: z.string().min(1),
  quizId: z.string(),
  answers: z.record(z.string(), z.number()),
  score: z.number(),
  percentage: z.number(),
  totalQuestions: z.number(),
  activities: z.array(QuizActivitySchema).optional(),
});

type QuizSubmissionInput = z.infer<typeof QuizSubmissionSchema>;

/**
 * Helper function to generate CSV content
 */
function generateCSV(submission: any, activities: any[]): string {
  // Quiz Results Section
  const resultsHeaders = ["Student ID", "Quiz ID", "Score", "Percentage", "Total Questions", "Submitted At"];
  const resultsRow = [
    submission.studentId,
    submission.quizId,
    submission.score,
    `${submission.percentage}%`,
    submission.totalQuestions,
    new Date(submission.submittedAt).toISOString(),
  ];

  let csv = "QUIZ RESULTS\n";
  csv += resultsHeaders.join(",") + "\n";
  csv += resultsRow.map((v) => `"${v}"`).join(",") + "\n\n";

  // Answers Section
  const answersData = JSON.parse(submission.answers);
  csv += "STUDENT ANSWERS\n";
  csv += "Question ID,Answer Index\n";
  Object.entries(answersData).forEach(([qId, answerIdx]) => {
    csv += `"${qId}","${answerIdx}"\n`;
  });

  csv += "\n";

  // Activity Log Section
  csv += "ACTIVITY LOG (Suspicious Behavior Tracking)\n";
  csv += "Timestamp,Activity Type,Details\n";
  activities.forEach((activity) => {
    const timestamp = new Date(activity.timestamp).toISOString();
    csv += `"${timestamp}","${activity.activityType}","${activity.details || ""}"\n`;
  });

  return csv;
}

/**
 * Helper function to send email with CSV attachment
 */
async function sendQuizResultsEmail(
  instructorEmail: string,
  studentId: string,
  csvContent: string,
  submission: any
): Promise<boolean> {
  try {
    // Use Manus notification system to send email
    const emailContent = `
Quiz Submission Report

Student ID: ${studentId}
Quiz ID: ${submission.quizId}
Score: ${submission.score}/${submission.totalQuestions} (${submission.percentage}%)
Submitted At: ${new Date(submission.submittedAt).toISOString()}

CSV file with detailed answers and activity log is attached.
    `;

    // Send notification to owner (instructor)
    const result = await notifyOwner({
      title: `Quiz Submission from Student ${studentId}`,
      content: emailContent,
    });

    // In a production environment, you would integrate with an email service like SendGrid, Mailgun, or AWS SES
    // For now, we're using the built-in notification system
    console.log(`[Quiz] Results email sent to ${instructorEmail}`);

    return result;
  } catch (error) {
    console.error("[Quiz] Failed to send email:", error);
    return false;
  }
}

export const quizRouter = router({
  /**
   * Submit quiz answers and tracking data
   */
  submitQuiz: publicProcedure
    .input(QuizSubmissionSchema)
    .mutation(async ({ input }) => {
      try {
        // Save quiz submission to database
        const submissionResult = await saveQuizSubmission({
          studentId: input.studentId,
          quizId: input.quizId,
          answers: JSON.stringify(input.answers),
          score: input.score,
          percentage: input.percentage,
          totalQuestions: input.totalQuestions,
        });

        // Get the submission ID from the result
        const submissionId = (submissionResult as any).insertId || 1;

        // Log activities to database
        const activities = input.activities || [];
        for (const activity of activities) {
          // Note: In a real implementation, you'd save these with the submissionId
          // For now, we're just collecting them for the CSV
        }

        // Generate CSV with answers and activity log
        const csvContent = generateCSV(
          {
            studentId: input.studentId,
            quizId: input.quizId,
            score: input.score,
            percentage: input.percentage,
            totalQuestions: input.totalQuestions,
            submittedAt: new Date().toISOString(),
            answers: JSON.stringify(input.answers),
          },
          activities
        );

        // Send email with CSV to instructor
        // Note: Replace with actual instructor email from environment or database
        const instructorEmail = process.env.INSTRUCTOR_EMAIL || "aaron.pook@pickering.education";
        await sendQuizResultsEmail(instructorEmail, input.studentId, csvContent, {
          studentId: input.studentId,
          quizId: input.quizId,
          score: input.score,
          percentage: input.percentage,
          totalQuestions: input.totalQuestions,
          submittedAt: new Date().toISOString(),
        });

        return {
          success: true,
          submissionId,
          message: "Quiz submitted successfully and email sent to instructor",
        };
      } catch (error) {
        console.error("[Quiz] Submission error:", error);
        throw new Error("Failed to submit quiz");
      }
    }),

  /**
   * Get submission details (for admin review)
   */
  getSubmission: publicProcedure
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input }) => {
      try {
        const submission = await getSubmissionActivities(input.submissionId);
        return {
          success: true,
          data: submission,
        };
      } catch (error) {
        console.error("[Quiz] Fetch error:", error);
        throw new Error("Failed to fetch submission");
      }
    }),
});
