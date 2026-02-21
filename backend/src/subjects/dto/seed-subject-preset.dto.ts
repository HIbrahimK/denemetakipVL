import { IsIn } from 'class-validator';

export const SUBJECT_SEED_PRESETS = [
  'TYT',
  'AYT',
  'LGS',
  'ACTIVITIES',
] as const;

export type SubjectSeedPreset = (typeof SUBJECT_SEED_PRESETS)[number];

export class SeedSubjectPresetDto {
  @IsIn(SUBJECT_SEED_PRESETS)
  preset: SubjectSeedPreset;
}
