// validationUtils.js

const ERROR_COLOR = "#F63049"; // default error color

export const isEmpty = (value) =>
  value === null || value === undefined || value.toString().trim() === "";

export const isEmailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isNumber = (value) =>
  !isNaN(value) && value !== "";

// Required field
export const validateRequired = (value, fieldName) => {
  if (isEmpty(value)) return { message: `${fieldName} is required`, color: ERROR_COLOR };
  return { message: "", color: "" };
};

// Email validation
export const validateEmail = (value) => {
  if (isEmpty(value)) return { message: "Email is required", color: ERROR_COLOR };
  if (!isEmailValid(value)) return { message: "Invalid email format", color: ERROR_COLOR };
  return { message: "", color: "" };
};

// Number validation
export const validateNumber = (value, fieldName) => {
  if (isEmpty(value)) return { message: `${fieldName} is required`, color: ERROR_COLOR };
  if (!isNumber(value)) return { message: `${fieldName} must be a number`, color: ERROR_COLOR };
  return { message: "", color: "" };
};

// Pattern validation (regex)
export const validatePattern = (value, pattern, message) => {
  if (!isEmpty(value) && !pattern.test(value)) return { message: message || "Invalid format", color: ERROR_COLOR };
  return { message: "", color: "" };
};
