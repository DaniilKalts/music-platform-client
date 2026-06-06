const parseLimit = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export const FREE_FAVORITES_LIMIT = parseLimit(process.env.NEXT_PUBLIC_FREE_FAVORITES_LIMIT, 20);
export const FREE_PLAYLIST_LIMIT = parseLimit(process.env.NEXT_PUBLIC_FREE_PLAYLIST_LIMIT, 3);
