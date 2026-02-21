import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  NotificationCampaign,
  NotificationDeliveryStatus,
  NotificationStatus,
  NotificationTargetType,
  NotificationType,
  Role,
} from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import webpush from 'web-push';
import { CreateNotificationCampaignDto } from './dto/create-notification-campaign.dto';
import { SubscribePushDto } from './dto/subscribe-push.dto';
import { UnsubscribePushDto } from './dto/unsubscribe-push.dto';
import { UpdateNotificationCampaignDto } from './dto/update-notification-campaign.dto';
import { UpdateUserNotificationSettingsDto } from './dto/update-user-notification-settings.dto';

type SystemNotificationInput = {
  schoolId: string;
  type: NotificationType;
  title: string;
  body: string;
  targetUserIds: string[];
  deeplink?: string;
  metadata?: Record<string, any>;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidEnabled = false;
  private vapidPublicKey = '';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.configureWebPush();
  }

  private configureWebPush() {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') ||
      'mailto:admin@denemetakip.net';

    if (!publicKey || !privateKey) {
      this.logger.warn(
        'VAPID keys are missing. Push notifications will be skipped.',
      );
      this.vapidEnabled = false;
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.vapidPublicKey = publicKey;
    this.vapidEnabled = true;
  }

  getPublicKey() {
    if (!this.vapidEnabled) {
      throw new BadRequestException(
        'Push anahtari tanimli degil. VAPID_PUBLIC_KEY ve VAPID_PRIVATE_KEY ayarlayin.',
      );
    }

    return { publicKey: this.vapidPublicKey };
  }

  async subscribe(userId: string, schoolId: string, dto: SubscribePushDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        schoolId,
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent,
        isActive: true,
        lastSeenAt: new Date(),
      },
      update: {
        schoolId,
        userId,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        userAgent: dto.userAgent,
        isActive: true,
        lastSeenAt: new Date(),
      },
    });
  }

  async unsubscribe(userId: string, dto: UnsubscribePushDto) {
    const subscription = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: dto.endpoint },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.pushSubscription.update({
      where: { endpoint: dto.endpoint },
      data: {
        isActive: false,
      },
    });
  }

  private async getOrCreateUserSettings(userId: string, schoolId: string) {
    return this.prisma.userNotificationSetting.upsert({
      where: { userId },
      create: {
        userId,
        schoolId,
      },
      update: {},
    });
  }

  async getMySettings(userId: string, schoolId: string) {
    return this.getOrCreateUserSettings(userId, schoolId);
  }

  async updateMySettings(
    userId: string,
    schoolId: string,
    dto: UpdateUserNotificationSettingsDto,
  ) {
    await this.getOrCreateUserSettings(userId, schoolId);

    return this.prisma.userNotificationSetting.update({
      where: { userId },
      data: dto,
    });
  }

  async listMyDeliveries(userId: string, schoolId: string) {
    return this.prisma.notificationDelivery.findMany({
      where: {
        userId,
        campaign: {
          schoolId,
        },
      },
      include: {
        campaign: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    });
  }

  async listCampaigns(schoolId: string) {
    return this.prisma.notificationCampaign.findMany({
      where: { schoolId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 300,
    });
  }

  async getCampaignDeliveries(campaignId: string, schoolId: string) {
    const campaign = await this.prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, schoolId: true },
    });

    if (!campaign || campaign.schoolId !== schoolId) {
      throw new NotFoundException('Bildirim kampanyasi bulunamadi');
    }

    return this.prisma.notificationDelivery.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        subscription: {
          select: {
            id: true,
            endpoint: true,
            isActive: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });
  }

  async createCampaign(
    dto: CreateNotificationCampaignDto,
    userId: string,
    schoolId: string,
  ) {
    const normalizedScheduledFor = dto.scheduledFor
      ? new Date(dto.scheduledFor)
      : null;
    if (normalizedScheduledFor && Number.isNaN(normalizedScheduledFor.valueOf())) {
      throw new BadRequestException('Gecersiz zamanlama tarihi');
    }

    let status: NotificationStatus = NotificationStatus.DRAFT;
    if (dto.sendNow) {
      status = NotificationStatus.SENT;
    } else if (normalizedScheduledFor) {
      status = NotificationStatus.SCHEDULED;
    }

    const campaign = await this.prisma.notificationCampaign.create({
      data: {
        schoolId,
        createdById: userId,
        type: dto.type || NotificationType.CUSTOM,
        targetType: dto.targetType || NotificationTargetType.ALL,
        targetRoles: dto.targetRoles || [],
        targetIds: dto.targetIds || [],
        title: dto.title,
        body: dto.body,
        deeplink: dto.deeplink,
        status,
        scheduledFor: normalizedScheduledFor,
      },
    });

    if (dto.sendNow || (normalizedScheduledFor && normalizedScheduledFor <= new Date())) {
      return this.sendCampaignNow(campaign.id, schoolId);
    }

    return campaign;
  }

  async updateCampaign(
    campaignId: string,
    schoolId: string,
    dto: UpdateNotificationCampaignDto,
  ) {
    const existing = await this.prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundException('Bildirim kampanyasi bulunamadi');
    }

    if (existing.status === NotificationStatus.SENT) {
      throw new BadRequestException(
        'Gonderilmis kampanya duzenlenemez. Yeni kampanya olusturun.',
      );
    }

    const updateData: any = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.body !== undefined) updateData.body = dto.body;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.targetType !== undefined) updateData.targetType = dto.targetType;
    if (dto.targetRoles !== undefined) updateData.targetRoles = dto.targetRoles;
    if (dto.targetIds !== undefined) updateData.targetIds = dto.targetIds;
    if (dto.deeplink !== undefined) updateData.deeplink = dto.deeplink;
    if (dto.scheduledFor !== undefined) {
      updateData.scheduledFor = dto.scheduledFor ? new Date(dto.scheduledFor) : null;
      updateData.status = dto.scheduledFor
        ? NotificationStatus.SCHEDULED
        : NotificationStatus.DRAFT;
    }

    const updated = await this.prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    if (dto.sendNow) {
      return this.sendCampaignNow(campaignId, schoolId);
    }

    return updated;
  }

  async deleteCampaign(campaignId: string, schoolId: string) {
    const existing = await this.prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, schoolId: true },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundException('Bildirim kampanyasi bulunamadi');
    }

    await this.prisma.notificationCampaign.delete({
      where: { id: campaignId },
    });

    return { success: true };
  }

  async cancelCampaign(campaignId: string, schoolId: string) {
    const existing = await this.prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!existing || existing.schoolId !== schoolId) {
      throw new NotFoundException('Bildirim kampanyasi bulunamadi');
    }

    if (existing.status === NotificationStatus.SENT) {
      throw new BadRequestException('Gonderilmis kampanya iptal edilemez');
    }

    return this.prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: { status: NotificationStatus.CANCELLED },
    });
  }

  private async loadCampaign(campaignId: string, schoolId: string) {
    const campaign = await this.prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      include: {
        school: true,
      },
    });

    if (!campaign || campaign.schoolId !== schoolId) {
      throw new NotFoundException('Bildirim kampanyasi bulunamadi');
    }

    return campaign;
  }

  async sendCampaignNow(campaignId: string, schoolId: string) {
    const campaign = await this.loadCampaign(campaignId, schoolId);

    if (campaign.status === NotificationStatus.CANCELLED) {
      throw new BadRequestException('Iptal edilen kampanya gonderilemez');
    }

    return this.sendCampaign(campaign);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledCampaigns() {
    const now = new Date();
    const scheduled = await this.prisma.notificationCampaign.findMany({
      where: {
        status: NotificationStatus.SCHEDULED,
        scheduledFor: { lte: now },
      },
      include: {
        school: true,
      },
      take: 50,
      orderBy: { scheduledFor: 'asc' },
    });

    for (const campaign of scheduled) {
      try {
        await this.sendCampaign(campaign);
      } catch (error: any) {
        this.logger.error(
          `Scheduled campaign ${campaign.id} failed: ${error?.message || error}`,
        );
      }
    }
  }

  async dispatchSystemNotification(input: SystemNotificationInput) {
    if (!input.targetUserIds.length) {
      return { success: true, recipientCount: 0 };
    }

    const campaign = await this.prisma.notificationCampaign.create({
      data: {
        schoolId: input.schoolId,
        type: input.type,
        status: NotificationStatus.SENT,
        targetType: NotificationTargetType.USERS,
        targetIds: [...new Set(input.targetUserIds)],
        targetRoles: [],
        title: input.title,
        body: input.body,
        deeplink: input.deeplink,
        metadata: input.metadata,
      },
      include: {
        school: true,
      },
    });

    return this.sendCampaign(campaign);
  }

  private isSchoolTypeEnabled(school: any, type: NotificationType) {
    if (!school.pushEnabled) {
      return false;
    }

    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return school.pushNewMessageEnabled;
      case NotificationType.EXAM_REMINDER:
        return school.pushExamReminderEnabled;
      case NotificationType.GROUP_POST:
        return school.pushGroupPostEnabled;
      case NotificationType.ACHIEVEMENT_UNLOCKED:
        return school.pushAchievementEnabled;
      case NotificationType.STUDY_PLAN_ASSIGNED:
        return school.pushStudyPlanEnabled;
      case NotificationType.CUSTOM:
      default:
        return school.pushCustomEnabled;
    }
  }

  private isUserTypeEnabled(setting: any, type: NotificationType) {
    if (!setting?.enabled) {
      return false;
    }

    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return setting.newMessage;
      case NotificationType.EXAM_REMINDER:
        return setting.examReminder;
      case NotificationType.GROUP_POST:
        return setting.groupPost;
      case NotificationType.ACHIEVEMENT_UNLOCKED:
        return setting.achievementUnlocked;
      case NotificationType.STUDY_PLAN_ASSIGNED:
        return setting.studyPlanAssigned;
      case NotificationType.CUSTOM:
      default:
        return setting.customNotification;
    }
  }

  private async resolveTargetUserIds(campaign: NotificationCampaign) {
    const targetType = campaign.targetType;
    const targetIds = campaign.targetIds || [];
    const targetRoles = campaign.targetRoles || [];

    const schoolFilter = { schoolId: campaign.schoolId, isActive: true };

    if (targetType === NotificationTargetType.ALL) {
      const users = await this.prisma.user.findMany({
        where: schoolFilter,
        select: { id: true },
      });
      return users.map((user) => user.id);
    }

    if (targetType === NotificationTargetType.ROLE) {
      if (!targetRoles.length) {
        return [];
      }
      const users = await this.prisma.user.findMany({
        where: {
          ...schoolFilter,
          role: { in: targetRoles },
        },
        select: { id: true },
      });
      return users.map((user) => user.id);
    }

    if (targetType === NotificationTargetType.USERS) {
      const users = await this.prisma.user.findMany({
        where: {
          ...schoolFilter,
          id: { in: targetIds },
        },
        select: { id: true },
      });
      return users.map((user) => user.id);
    }

    const roleSet = new Set(targetRoles);
    const includeStudents = !targetRoles.length || roleSet.has(Role.STUDENT);
    const includeParents = !targetRoles.length || roleSet.has(Role.PARENT);
    const includeTeachers = !targetRoles.length || roleSet.has(Role.TEACHER);

    if (targetType === NotificationTargetType.GRADE) {
      const students = await this.prisma.student.findMany({
        where: {
          schoolId: campaign.schoolId,
          class: {
            gradeId: {
              in: targetIds,
            },
          },
        },
        select: {
          userId: true,
          parent: {
            select: {
              userId: true,
            },
          },
        },
      });

      const result = new Set<string>();
      if (includeStudents) {
        students.forEach((student) => result.add(student.userId));
      }
      if (includeParents) {
        students.forEach((student) => {
          if (student.parent?.userId) {
            result.add(student.parent.userId);
          }
        });
      }
      if (includeTeachers) {
        const teachers = await this.prisma.user.findMany({
          where: {
            schoolId: campaign.schoolId,
            role: Role.TEACHER,
            isActive: true,
          },
          select: { id: true },
        });
        teachers.forEach((teacher) => result.add(teacher.id));
      }
      return [...result];
    }

    if (targetType === NotificationTargetType.CLASS) {
      const students = await this.prisma.student.findMany({
        where: {
          schoolId: campaign.schoolId,
          classId: { in: targetIds },
        },
        select: {
          userId: true,
          parent: {
            select: {
              userId: true,
            },
          },
        },
      });

      const result = new Set<string>();
      if (includeStudents) {
        students.forEach((student) => result.add(student.userId));
      }
      if (includeParents) {
        students.forEach((student) => {
          if (student.parent?.userId) {
            result.add(student.parent.userId);
          }
        });
      }
      if (includeTeachers) {
        const teachers = await this.prisma.user.findMany({
          where: {
            schoolId: campaign.schoolId,
            role: Role.TEACHER,
            isActive: true,
          },
          select: { id: true },
        });
        teachers.forEach((teacher) => result.add(teacher.id));
      }
      return [...result];
    }

    if (targetType === NotificationTargetType.GROUP) {
      const memberships = await this.prisma.groupMembership.findMany({
        where: {
          schoolId: campaign.schoolId,
          groupId: { in: targetIds },
          leftAt: null,
        },
        include: {
          student: {
            select: {
              userId: true,
              parent: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      const result = new Set<string>();
      if (includeStudents) {
        memberships.forEach((membership) => result.add(membership.student.userId));
      }
      if (includeParents) {
        memberships.forEach((membership) => {
          if (membership.student.parent?.userId) {
            result.add(membership.student.parent.userId);
          }
        });
      }

      if (includeTeachers) {
        const groups = await this.prisma.mentorGroup.findMany({
          where: {
            id: { in: targetIds },
            schoolId: campaign.schoolId,
          },
          include: {
            teacherAssignments: {
              where: { leftAt: null },
              select: { teacherId: true },
            },
          },
        });
        groups.forEach((group) => {
          if (group.teacherId) {
            result.add(group.teacherId);
          }
          group.teacherAssignments.forEach((assignment) =>
            result.add(assignment.teacherId),
          );
        });
      }

      return [...result];
    }

    return [];
  }

  private async sendCampaign(campaign: NotificationCampaign & { school: any }) {
    const school = campaign.school;

    const targetUserIds = await this.resolveTargetUserIds(campaign);
    if (!targetUserIds.length) {
      await this.prisma.notificationCampaign.update({
        where: { id: campaign.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
      return { success: true, recipientCount: 0, delivered: 0, failed: 0 };
    }

    const users = await this.prisma.user.findMany({
      where: {
        schoolId: campaign.schoolId,
        id: { in: targetUserIds },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const activeUserIds = users.map((user) => user.id);

    const userSettings = await this.prisma.userNotificationSetting.findMany({
      where: {
        userId: { in: activeUserIds },
      },
    });
    const settingsMap = new Map(userSettings.map((setting) => [setting.userId, setting]));

    const deliveries: Array<{
      campaignId: string;
      userId: string;
      subscriptionId?: string;
      status: NotificationDeliveryStatus;
      errorMessage?: string;
      deliveredAt?: Date;
      readAt?: Date | null;
    }> = [];

    if (!this.isSchoolTypeEnabled(school, campaign.type)) {
      activeUserIds.forEach((userId) => {
        deliveries.push({
          campaignId: campaign.id,
          userId,
          status: NotificationDeliveryStatus.SKIPPED,
          errorMessage: 'SCHOOL_NOTIFICATION_TYPE_DISABLED',
        });
      });
    } else {
      const eligibleUserIds: string[] = [];
      activeUserIds.forEach((userId) => {
        const userSetting = settingsMap.get(userId) || {
          enabled: true,
          newMessage: true,
          examReminder: true,
          groupPost: true,
          achievementUnlocked: true,
          studyPlanAssigned: true,
          customNotification: true,
        };
        if (this.isUserTypeEnabled(userSetting, campaign.type)) {
          eligibleUserIds.push(userId);
        } else {
          deliveries.push({
            campaignId: campaign.id,
            userId,
            status: NotificationDeliveryStatus.SKIPPED,
            errorMessage: 'USER_NOTIFICATION_TYPE_DISABLED',
          });
        }
      });

      if (!this.vapidEnabled) {
        eligibleUserIds.forEach((userId) => {
          deliveries.push({
            campaignId: campaign.id,
            userId,
            status: NotificationDeliveryStatus.SKIPPED,
            errorMessage: 'VAPID_NOT_CONFIGURED',
          });
        });
      } else {
        const subscriptions = await this.prisma.pushSubscription.findMany({
          where: {
            schoolId: campaign.schoolId,
            userId: { in: eligibleUserIds },
            isActive: true,
          },
          select: {
            id: true,
            userId: true,
            endpoint: true,
            p256dh: true,
            auth: true,
          },
        });

        const subscriptionsByUser = new Map<string, typeof subscriptions>();
        subscriptions.forEach((subscription) => {
          const list = subscriptionsByUser.get(subscription.userId) || [];
          list.push(subscription);
          subscriptionsByUser.set(subscription.userId, list);
        });

        const notificationPayload = (campaignUserId: string) =>
          JSON.stringify({
            campaignId: campaign.id,
            type: campaign.type,
            title: campaign.title,
            body: campaign.body,
            url: campaign.deeplink || '/dashboard/notifications',
            icon: campaign.iconUrl || '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            userId: campaignUserId,
          });

        for (const userId of eligibleUserIds) {
          const userSubscriptions = subscriptionsByUser.get(userId) || [];
          if (!userSubscriptions.length) {
            deliveries.push({
              campaignId: campaign.id,
              userId,
              status: NotificationDeliveryStatus.SKIPPED,
              errorMessage: 'NO_ACTIVE_SUBSCRIPTION',
            });
            continue;
          }

          for (const subscription of userSubscriptions) {
            try {
              await webpush.sendNotification(
                {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                  },
                },
                notificationPayload(userId),
              );

              deliveries.push({
                campaignId: campaign.id,
                userId,
                subscriptionId: subscription.id,
                status: NotificationDeliveryStatus.SENT,
                deliveredAt: new Date(),
              });
            } catch (error: any) {
              const statusCode = error?.statusCode;
              if (statusCode === 404 || statusCode === 410) {
                await this.prisma.pushSubscription.update({
                  where: { id: subscription.id },
                  data: { isActive: false },
                });
              }

              deliveries.push({
                campaignId: campaign.id,
                userId,
                subscriptionId: subscription.id,
                status: NotificationDeliveryStatus.FAILED,
                errorMessage: error?.message || 'PUSH_SEND_FAILED',
              });
            }
          }
        }
      }
    }

    if (deliveries.length) {
      await this.prisma.notificationDelivery.createMany({
        data: deliveries.map((delivery) => ({
          campaignId: delivery.campaignId,
          userId: delivery.userId,
          subscriptionId: delivery.subscriptionId,
          status: delivery.status,
          errorMessage: delivery.errorMessage,
          deliveredAt: delivery.deliveredAt,
          readAt: delivery.readAt || null,
        })),
      });
    }

    await this.prisma.notificationCampaign.update({
      where: { id: campaign.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });

    const deliveredCount = deliveries.filter(
      (delivery) => delivery.status === NotificationDeliveryStatus.SENT,
    ).length;
    const failedCount = deliveries.filter(
      (delivery) => delivery.status === NotificationDeliveryStatus.FAILED,
    ).length;
    const skippedCount = deliveries.filter(
      (delivery) => delivery.status === NotificationDeliveryStatus.SKIPPED,
    ).length;

    return {
      success: true,
      recipientCount: activeUserIds.length,
      delivered: deliveredCount,
      failed: failedCount,
      skipped: skippedCount,
    };
  }
}

