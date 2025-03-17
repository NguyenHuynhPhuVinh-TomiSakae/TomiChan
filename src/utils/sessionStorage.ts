/* eslint-disable @typescript-eslint/no-explicit-any */
export const getSessionStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    const value = sessionStorage.getItem(key);
    return value ? value : defaultValue;
  }
  return defaultValue;
};

export const setSessionStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }
};

export const removeSessionStorage = (key: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(key);
  }
};
