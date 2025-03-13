export async function getApiKey(
  keyName: string,
  localStorageKey: string
): Promise<string> {
  // Kiểm tra localStorage trước
  const localKey = localStorage.getItem(localStorageKey);
  if (localKey) {
    return localKey;
  }

  try {
    // Nếu không có trong localStorage, thử lấy từ API route
    const response = await fetch("/api/keys");
    const keys = await response.json();

    // Trả về key từ env nếu có
    return keys[keyName] || "";
  } catch (error) {
    console.error("Lỗi khi lấy API key:", error);
    return "";
  }
}
