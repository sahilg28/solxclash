// Level system utilities
export const XP_PER_LEVEL = 500; // Changed from 1000 to 500

export const getLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export const getXpForNextLevel = (xp: number): number => {
  return (Math.floor(xp / XP_PER_LEVEL) + 1) * XP_PER_LEVEL;
};

export const getXpProgress = (xp: number): number => {
  return xp % XP_PER_LEVEL;
};

export const getXpProgressPercentage = (xp: number): number => {
  return (getXpProgress(xp) / XP_PER_LEVEL) * 100;
};