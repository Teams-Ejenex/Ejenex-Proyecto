//Validación
export const validateNotice = (notice) => {
  if (!notice.title || !notice.description) return false;
  if (!notice.start_date || !notice.end_date) return false;
  return true;
};