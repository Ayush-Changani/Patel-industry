export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN");
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN");
};
