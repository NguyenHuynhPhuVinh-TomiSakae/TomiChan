interface TransformRule {
  pattern: RegExp;
  replacement: string;
}

const transformRules: TransformRule[] = [
  {
    pattern: /\[SEARCH_RESULT\]([\s\S]*?)\[\/SEARCH_RESULT\]/g,
    replacement: "<search-result>$1</search-result>",
  },
  {
    pattern: /\[SEARCH_LINK\]([\s\S]*?)\[\/SEARCH_LINK\]/g,
    replacement: "<search-link>$1</search-link>",
  },
  {
    pattern: /\[SEARCH_BLOCK\]([\s\S]*?)\[\/SEARCH_BLOCK\]/g,
    replacement: "<search-block>$1</search-block>",
  },
  {
    pattern: /\[MagicMode\]([\s\S]*?)\[\/MagicMode\]/g,
    replacement: "<magic-mode>$1</magic-mode>",
  },
  {
    pattern: /\[CodeManager\]([\s\S]*?)\[\/CodeManager\]/g,
    replacement: "<code-manager>$1</code-manager>",
  },
  {
    pattern: /\[CreateFile\]([\s\S]*?)\[\/CreateFile\]/g,
    replacement: "<create-file>$1</create-file>",
  },
  {
    pattern: /\[CreateFolder\]([\s\S]*?)\[\/CreateFolder\]/g,
    replacement: "<create-folder>$1</create-folder>",
  },
  {
    pattern: /\[RenameFile\]([\s\S]*?)\[\/RenameFile\]/g,
    replacement: "<rename-file>$1</rename-file>",
  },
  {
    pattern: /\[RenameFolder\]([\s\S]*?)\[\/RenameFolder\]/g,
    replacement: "<rename-folder>$1</rename-folder>",
  },
  {
    pattern: /\[DeleteFile\]([\s\S]*?)\[\/DeleteFile\]/g,
    replacement: "<delete-file>$1</delete-file>",
  },
  {
    pattern: /\[DeleteFolder\]([\s\S]*?)\[\/DeleteFolder\]/g,
    replacement: "<delete-folder>$1</delete-folder>",
  },
  {
    pattern: /\[CreateProject\]([\s\S]*?)\[\/CreateProject\]/g,
    replacement: "<create-project>$1</create-project>",
  },
  {
    pattern: /\[UpdateProject\]([\s\S]*?)\[\/UpdateProject\]/g,
    replacement: "<update-project>$1</update-project>",
  },
  {
    pattern: /\[DeleteProject\]([\s\S]*?)\[\/DeleteProject\]/g,
    replacement: "<delete-project>$1</delete-project>",
  },
  {
    pattern: /\[OpenMedia\]([\s\S]*?)\[\/OpenMedia\]/g,
    replacement: "<open-media>$1</open-media>",
  },
  {
    pattern: /\[MediaView\]([\s\S]*?)\[\/MediaView\]/g,
    replacement: "<media-view>$1</media-view>",
  },
  {
    pattern: /\[OpenCode\]([\s\S]*?)\[\/OpenCode\]/g,
    replacement: "<open-code>$1</open-code>",
  },
  {
    pattern: /\[CodeEditor\]([\s\S]*?)\[\/CodeEditor\]/g,
    replacement: "<code-editor>$1</code-editor>",
  },
  {
    pattern: /\[PATH\]([\s\S]*?)\[\/PATH\]/g,
    replacement: "<file-path>$1</file-path>",
  },
  {
    pattern: /\[EMAIL\]([\s\S]*?)\[\/EMAIL\]/g,
    replacement: "<email-block>$1</email-block>",
  },
  {
    pattern: /\[TVU_SCHEDULE\]([\s\S]*?)\[\/TVU_SCHEDULE\]/g,
    replacement: "<tvu-schedule-block>$1</tvu-schedule-block>",
  },
  {
    pattern: /\[TVU_SCHEDULE_RESULT\]([\s\S]*?)\[\/TVU_SCHEDULE_RESULT\]/g,
    replacement: "<tvu-schedule-result>$1</tvu-schedule-result>",
  },
  {
    pattern: /\[TVU_SCORE\]([\s\S]*?)\[\/TVU_SCORE\]/g,
    replacement: "<tvu-score-block>$1</tvu-score-block>",
  },
  {
    pattern: /\[TVU_SCORE_RESULT\]([\s\S]*?)\[\/TVU_SCORE_RESULT\]/g,
    replacement: "<tvu-score-result>$1</tvu-score-result>",
  },
  {
    pattern: /\[ANIME_SEARCH\]([\s\S]*?)\[\/ANIME_SEARCH\]/g,
    replacement: "<anime-search-block>$1</anime-search-block>",
  },
  {
    pattern: /\[ANIME_SEARCH_RESULT\]([\s\S]*?)\[\/ANIME_SEARCH_RESULT\]/g,
    replacement: "<anime-search-result>$1</anime-search-result>",
  },
  {
    pattern: /\[python_exec\]([\s\S]*?)\[\/python_exec\]/g,
    replacement: "<python-exec>$1</python-exec>",
  },
  {
    pattern: /\[python_result\]([\s\S]*?)\[\/python_result\]/g,
    replacement: "<python-result>$1</python-result>",
  },
];

export function transformMarkdownContent(content: string): string {
  // Tách nội dung thành các phần trước, trong và sau thẻ think
  const parts = content.split(/(<think>[\s\S]*?<\/think>)/);

  // Xử lý từng phần
  const transformedParts = parts.map((part) => {
    // Nếu là phần nằm trong <think>, giữ nguyên
    if (part.startsWith("<think>")) {
      return part;
    }

    // Với các phần khác, áp dụng các quy tắc chuyển đổi
    return transformRules.reduce((processedContent, rule) => {
      return processedContent.replace(rule.pattern, (_, p1) =>
        rule.replacement.replace("$1", p1)
      );
    }, part);
  });

  // Nối các phần lại với nhau
  return transformedParts.join("");
}
