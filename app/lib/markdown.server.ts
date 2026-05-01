import { marked, Renderer } from "marked";
import { type Highlighter, createHighlighter } from "shiki";

let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark"],
      langs: ["typescript", "javascript", "json", "bash", "html", "css", "tsx", "jsx", "sql", "yaml", "markdown", "text", "plaintext"],
    });
  }
  return highlighter;
}

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

function wrapCodeBlock(html: string): string {
  return `<div class="code-block">${html}<button class="copy-code-btn" aria-label="Copy code">${COPY_ICON}<span>Copy</span></button></div>`;
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const hl = await getHighlighter();

  const renderer = new Renderer();
  renderer.code = ({ text, lang }) => {
    const language = lang || "text";
    try {
      return wrapCodeBlock(hl.codeToHtml(text, {
        lang: language,
        theme: "github-dark",
      }));
    } catch {
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return wrapCodeBlock(`<pre><code>${escaped}</code></pre>`);
    }
  };

  return marked.parse(markdown, { renderer }) as string;
}
