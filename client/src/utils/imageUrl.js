export const getImageUrl = (photoPath) => {
  if (!photoPath) return '';
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  // Replace any initial multiple slashes (e.g. //uploads) with a single slash (/uploads)
  return photoPath.replace(/^\/+/, '/');
};
