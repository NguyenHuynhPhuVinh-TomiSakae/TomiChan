export const getSentFilesPrompt = (
  sentFiles: Array<{ name: string; content: string }>
) => `
Dưới đây là nội dung của các file đã được gửi cho bạn:

${sentFiles
  .map(
    (file) => `File: ${file.name}
\`\`\`
${file.content}
\`\`\``
  )
  .join("\n\n")}
`;
