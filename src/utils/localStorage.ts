/* eslint-disable @typescript-eslint/no-explicit-any */
export const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    const value = localStorage.getItem(key);
    return value ? value : defaultValue;
  }
  return defaultValue;
};

export const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

export const removeLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
