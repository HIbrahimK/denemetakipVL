import { PrismaClient } from '@prisma/client';
import {
  ALL_ACHIEVEMENT_BUNDLES,
  AchievementSeedBundle,
  getAchievementsForBundles,
} from '../src/achievements/achievement-seed-bundles';

const prisma = new PrismaClient();

async function upsertAchievements(
  schoolId: string,
  bundles: AchievementSeedBundle[],
) {
  const achievements = getAchievementsForBundles(bundles);
  let created = 0;
  let updated = 0;

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: {
        schoolId,
        type: achievement.type,
      },
    });

    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          requirement: achievement.requirement,
          iconName: achievement.iconName,
          colorScheme: achievement.colorScheme,
          points: achievement.points,
          examType: achievement.examType,
          isActive: true,
        },
      });
      updated++;
    } else {
      await prisma.achievement.create({
        data: {
          ...achievement,
          schoolId,
        },
      });
      created++;
    }
  }

  return {
    created,
    updated,
    total: created + updated,
  };
}

export async function seedAchievementBundle(
  schoolId: string,
  bundle: AchievementSeedBundle,
) {
  return upsertAchievements(schoolId, [bundle]);
}

export async function seedAchievements(schoolId: string) {
  console.log('Seeding achievement bundles...');
  const result = await upsertAchievements(schoolId, ALL_ACHIEVEMENT_BUNDLES);
  console.log(
    `Created/Updated ${result.total} achievements (created: ${result.created}, updated: ${result.updated})`,
  );
  return result;
}

