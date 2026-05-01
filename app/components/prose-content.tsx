import { useRef } from "react";

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export function ProseContent({ html, className }: { html: string; className?: string }) {
  const timers = useRef(new Map<Element, ReturnType<typeof setTimeout>>());

  function showCopied(btn: HTMLButtonElement) {
    btn.innerHTML = `${CHECK_ICON}<span>Copied!</span>`;
    btn.classList.add("copied");
    const existing = timers.current.get(btn);
    if (existing) clearTimeout(existing);
    timers.current.set(btn, setTimeout(() => {
      btn.innerHTML = `${COPY_ICON}<span>Copy</span>`;
      btn.classList.remove("copied");
      timers.current.delete(btn);
    }, 2000));
  }

  function fallbackCopy(text: string, btn: HTMLButtonElement) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      showCopied(btn);
    } finally {
      ta.remove();
    }
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const btn = (e.target as Element).closest<HTMLButtonElement>(".copy-code-btn");
    if (!btn) return;

    const pre = btn.closest(".code-block")?.querySelector("pre");
    if (!pre) return;

    const text = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showCopied(btn)).catch(() => fallbackCopy(text, btn));
    } else {
      fallbackCopy(text, btn);
    }
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={handleClick}
    />
  );
}
