import prisma from '@/lib/prisma';

/**
 * Helper function to log system activities to the ActivityLog table
 */
export async function logActivity(action: string, details?: string, userId?: number, ipAddress?: string) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        details,
        userId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
