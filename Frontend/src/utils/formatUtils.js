export const safeText = (value) => {
  return value === null || value === undefined || value === ""
    ? "-"
    : value;
};

export const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatCurrency = (amount) => {
  if (!amount) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};
