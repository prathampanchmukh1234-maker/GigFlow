// Fallback image for gigs
export const FALLBACK_IMAGE =
  "https://via.placeholder.com/800x600?text=No+Image";

// Fallback avatar generator
export const FALLBACK_AVATAR = (userId: string) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`;
};
