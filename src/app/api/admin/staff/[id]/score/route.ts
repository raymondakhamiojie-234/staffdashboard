import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini SDK
// Note: Requires GEMINI_API_KEY in .env
const ai = new GoogleGenAI({});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const staffId = parseInt(params.id);

    // Fetch user and their stats for the current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const user = await prisma.user.findUnique({
      where: { id: staffId },
      include: {
        tasksReceived: {
          where: {
            createdAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1)
            }
          }
        },
        reportsSubmitted: {
          where: {
            submittedAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1)
            }
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Aggregate stats
    const totalTasks = user.tasksReceived.length;
    const completedTasks = user.tasksReceived.filter(t => t.status === 'completed').length;
    const overdueTasks = user.tasksReceived.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const totalReports = user.reportsSubmitted.length;

    // Prompt Gemini
    const prompt = `
      You are an HR Performance Evaluator AI.
      Analyze the following employee metrics for this month:
      - Tasks Assigned: ${totalTasks}
      - Tasks Completed: ${completedTasks} (${taskCompletionRate.toFixed(1)}%)
      - Overdue Tasks: ${overdueTasks}
      - Reports Submitted: ${totalReports}

      Calculate a performance score from 0 to 100 based on completion rate, consistency, and delays.
      Determine a category exactly matching one of these: "Excellent", "Good", "Average", "Needs Improvement".
      Determine a recommendation such as "Salary Increase", "Promotion", "Maintain Current Status", or "Warning".

      Return the result ONLY as a raw valid JSON object without markdown formatting. Example format:
      {
        "score": 85,
        "category": "Good",
        "recommendation": "Maintain Current Status",
        "details": "The employee has a solid completion rate but needs to watch out for overdue tasks."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error("AI returned empty response");

    const aiResult = JSON.parse(textOutput);

    // Save Score
    const scoreRecord = await prisma.performanceScore.create({
      data: {
        userId: user.id,
        score: aiResult.score,
        category: aiResult.category,
        recommendation: aiResult.recommendation,
        details: aiResult.details,
        month: currentMonth,
        year: currentYear
      }
    });

    return NextResponse.json(scoreRecord);
  } catch (error: any) {
    console.error("AI Scoring Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
