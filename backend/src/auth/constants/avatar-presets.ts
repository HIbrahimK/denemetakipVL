export const AVATAR_PRESET_OPTIONS = {
  avataaars: [
    'Felix',
    'Aneka',
    'Luna',
    'Max',
    'Sophie',
    'Oliver',
    'Emma',
    'Jack',
    'Deniz',
    'Mert',
    'Zeynep',
    'Ayse',
    'Berk',
    'Elif',
    'Eren',
    'Asli',
  ],
  bottts: [
    'Bot1',
    'Bot2',
    'Bot3',
    'Bot4',
    'Bot5',
    'Bot6',
    'Bot7',
    'Bot8',
    'Bot9',
    'Bot10',
    'Bot11',
    'Bot12',
    'Bot13',
    'Bot14',
    'Bot15',
    'Bot16',
  ],
  personas: [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Eve',
    'Frank',
    'Grace',
    'Henry',
    'Iris',
    'Jason',
    'Karen',
    'Leo',
    'Mia',
    'Nora',
    'Owen',
    'Paul',
  ],
  lorelei: [
    'Aria',
    'Bella',
    'Clara',
    'Daisy',
    'Ella',
    'Fiona',
    'Gwen',
    'Holly',
    'Ines',
    'Jade',
    'Kira',
    'Lily',
    'Maya',
    'Nina',
    'Opal',
    'Pia',
  ],
  micah: [
    'Sam1',
    'Sam2',
    'Sam3',
    'Sam4',
    'Sam5',
    'Sam6',
    'Sam7',
    'Sam8',
    'Sam9',
    'Sam10',
    'Sam11',
    'Sam12',
    'Sam13',
    'Sam14',
    'Sam15',
    'Sam16',
  ],
  adventurer: [
    'Hero1',
    'Hero2',
    'Hero3',
    'Hero4',
    'Hero5',
    'Hero6',
    'Hero7',
    'Hero8',
    'Hero9',
    'Hero10',
    'Hero11',
    'Hero12',
    'Hero13',
    'Hero14',
    'Hero15',
    'Hero16',
  ],
} as const;

export type AllowedAvatarStyle = keyof typeof AVATAR_PRESET_OPTIONS;

export const ALLOWED_AVATAR_STYLES = Object.keys(
  AVATAR_PRESET_OPTIONS,
) as AllowedAvatarStyle[];

export function parseAvatarSeed(
  avatarSeed: string,
): { style: string; seed: string } | null {
  const parts = avatarSeed.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const style = parts[0]?.trim();
  const seed = parts[1]?.trim();
  if (!style || !seed) {
    return null;
  }

  return { style, seed };
}

export function isAllowedAvatarStyle(style: string): style is AllowedAvatarStyle {
  return ALLOWED_AVATAR_STYLES.includes(style as AllowedAvatarStyle);
}

export function isAllowedStudentAvatar(style: string, seed: string): boolean {
  if (!isAllowedAvatarStyle(style)) {
    return false;
  }

  const seeds = AVATAR_PRESET_OPTIONS[style] as readonly string[];
  return seeds.includes(seed);
}
