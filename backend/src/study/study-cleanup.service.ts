import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudyCleanupService {
  private readonly logger = new Logger(StudyCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs on the 1st day of every month at midnight
   * Deletes assignments and tasks from the previous month
   */
  @Cron('0 0 1 * *', {
    name: 'cleanup-old-study-assignments',
    timeZone: 'Europe/Istanbul',
  })
  async handleMonthlyCleanup() {
    this.logger.log('Starting monthly cleanup of old study assignments...');

    try {
      // Get cleanup settings from database
      const settings = await this.getCleanupSettings();
      
      if (!settings.enabled) {
        this.logger.log('Cleanup is disabled in settings');
        return;
      }

      // Calculate cutoff date (previous month)
      const now = new Date();
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - settings.monthsToKeep, 1);
      
      this.logger.log(`Cleaning up assignments older than: ${cutoffDate.toISOString()}`);

      // Find old active plans (not templates) to clean up
      const oldActivePlans = await this.prisma.studyPlan.findMany({
        where: {
          createdAt: { lt: cutoffDate },
          isTemplate: false, // Only clean active plans, not templates
          status: { in: ['COMPLETED', 'CANCELLED', 'ACTIVE'] },
        },
        select: { id: true },
      });

      if (oldActivePlans.length === 0) {
        this.logger.log('No old active plans to clean up');
        return;
      }

      const planIds = oldActivePlans.map(p => p.id);

      // Find assignments related to these plans
      const oldAssignments = await this.prisma.studyPlanAssignment.findMany({
        where: {
          planId: { in: planIds },
        },
        select: { id: true },
      });

      const assignmentIds = oldAssignments.map(a => a.id);

      // Delete related tasks first
      const deletedTasks = await this.prisma.studyTask.deleteMany({
        where: { 
          OR: [
            { assignmentId: { in: assignmentIds } },
            { planId: { in: planIds } },
          ]
        },
      });

      // Delete assignments
      const deletedAssignments = await this.prisma.studyPlanAssignment.deleteMany({
        where: { id: { in: assignmentIds } },
      });

      // Delete active plans (but keep templates)
      const deletedPlans = await this.prisma.studyPlan.deleteMany({
        where: { id: { in: planIds } },
      });

      // Update last cleanup timestamp
      await this.updateLastCleanupTimestamp();

      this.logger.log(
        `Cleanup completed: Deleted ${deletedPlans.count} active plans, ${deletedAssignments.count} assignments, and ${deletedTasks.count} tasks`
      );
    } catch (error) {
      this.logger.error('Error during monthly cleanup:', error);
    }
  }

  /**
   * Get cleanup settings from database
   * Falls back to defaults if not found
   */
  private async getCleanupSettings(): Promise<{
    enabled: boolean;
    monthsToKeep: number;
  }> {
    try {
      // Get from School table - use first school's settings
      const school = await this.prisma.school.findFirst({
        select: {
          autoCleanupEnabled: true,
          cleanupMonthsToKeep: true,
        },
      });

      if (school) {
        return {
          enabled: school.autoCleanupEnabled ?? true,
          monthsToKeep: school.cleanupMonthsToKeep ?? 1,
        };
      }
    } catch (error) {
      this.logger.warn('Could not fetch cleanup settings, using defaults');
    }

    // Default settings
    return {
      enabled: true,
      monthsToKeep: 1,
    };
  }

  /**
   * Update last cleanup timestamp in settings
   */
  private async updateLastCleanupTimestamp() {
    try {
      // Update all schools' lastCleanupAt
      await this.prisma.school.updateMany({
        data: {
          lastCleanupAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn('Could not update lastCleanupAt timestamp');
    }
  }

  /**
   * Manual cleanup trigger (can be called from API endpoint)
   */
  async manualCleanup(schoolId?: string): Promise<{
    deletedPlans: number;
    deletedAssignments: number;
    deletedTasks: number;
  }> {
    this.logger.log('Starting manual cleanup...');

    const settings = await this.getCleanupSettings();
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - settings.monthsToKeep, 1);

    const planWhere: any = {
      createdAt: { lt: cutoffDate },
      isTemplate: false, // Only clean active plans
      status: { in: ['COMPLETED', 'CANCELLED', 'ACTIVE'] },
    };

    if (schoolId) {
      planWhere.schoolId = schoolId;
    }

    const oldActivePlans = await this.prisma.studyPlan.findMany({
      where: planWhere,
      select: { id: true },
    });

    if (oldActivePlans.length === 0) {
      return { deletedPlans: 0, deletedAssignments: 0, deletedTasks: 0 };
    }

    const planIds = oldActivePlans.map(p => p.id);

    const oldAssignments = await this.prisma.studyPlanAssignment.findMany({
      where: { planId: { in: planIds } },
      select: { id: true },
    });

    if (oldAssignments.length === 0) {
      return { deletedPlans: 0, deletedAssignments: 0, deletedTasks: 0 };
    }

    const assignmentIds = oldAssignments.map(a => a.id);

    const deletedTasks = await this.prisma.studyTask.deleteMany({
      where: { 
        OR: [
          { assignmentId: { in: assignmentIds } },
          { planId: { in: planIds } },
        ]
      },
    });

    const deletedAssignments = await this.prisma.studyPlanAssignment.deleteMany({
      where: { id: { in: assignmentIds } },
    });

    const deletedPlans = await this.prisma.studyPlan.deleteMany({
      where: { id: { in: planIds } },
    });

    await this.updateLastCleanupTimestamp();

    return {
      deletedPlans: deletedPlans.count,
      deletedAssignments: deletedAssignments.count,
      deletedTasks: deletedTasks.count,
    };
  }
}
