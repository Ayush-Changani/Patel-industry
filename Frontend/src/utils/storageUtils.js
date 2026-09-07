export const setItem = (key, value, expiryInMinutes) => {
  const item = {
    value,
    expiry: expiryInMinutes
      ? Date.now() + expiryInMinutes * 60 * 1000
      : null,
  };

  localStorage.setItem(key, JSON.stringify(item));
};

export const getItem = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    if (item.expiry && Date.now() > item.expiry) {
      removeItem(key);
      return null;
    }

    return item.value;
  } catch {
    removeItem(key);
    return null;
  }
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
};
