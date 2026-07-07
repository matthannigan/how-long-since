// Convert straight ASCII quotes/apostrophes to curly (smart) quotes.
//
// Ported from the project's curly-quotes_md.py / curly-quotes_html.py. Shared by
// the Markdown/HTML CLIs and by the user-guide generator (which smartifies the
// Markdown in memory before rendering, so the served page is always curly).

// Characters that mark an opening context for a quote: whitespace, opening
// brackets, em/en dash, hyphen, Markdown emphasis markers (* _ — so a quote that
// opens right after **bold**/_italic_ isn't misread as closing), and the
// protection-marker boundary (\x00).
const OPENERS = ' \t\n\r([*_—–-\x00';

/** Convert straight quotes/apostrophes to curly equivalents in a plain string. */
export function smartifyText(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : '';
    if (ch === '"') {
      out += i === 0 || OPENERS.includes(prev) ? '“' : '”';
    } else if (ch === "'") {
      if (i > 0 && /[a-zA-Z]/.test(prev)) {
        out += '’'; // apostrophe / closing single quote
      } else if (i === 0 || OPENERS.includes(prev)) {
        out += '‘'; // opening single quote
      } else {
        out += '’';
      }
    } else {
      out += ch;
    }
  }
  return out;
}

/** Replace matches of `re` with an opaque marker, stashing the original for later restore. */
function protector(store) {
  return (match) => {
    const key = `\x00PROTECTED${store.size}\x00`;
    store.set(key, match);
    return key;
  };
}

/**
 * Smartify Markdown prose only, leaving structure untouched: frontmatter, fenced
 * and inline code, raw <style>/<script>, inline HTML tags/autolinks, wikilinks,
 * link/image URLs, and reference-link definitions.
 */
export function smartifyMarkdown(md) {
  const store = new Map();
  const protect = protector(store);

  // Order matters: structural blocks first, then inline patterns.
  md = md.replace(/^---\n[\s\S]*?\n---\n/, protect); // 1. YAML frontmatter (file start)
  md = md.replace(/^(```|~~~)[^\n]*\n[\s\S]*?\n\1[^\n]*$/gm, protect); // 2. fenced code
  md = md.replace(/<(style|script)[\s>][\s\S]*?<\/\1>/gi, protect); // 3. raw style/script
  md = md.replace(/``[^`\n]+?``/g, protect); // 4a. inline code (double backtick)
  md = md.replace(/`[^`\n]+?`/g, protect); // 4b. inline code (single backtick)
  md = md.replace(/\[\[[^\]]+\]\]/g, protect); // 5. wikilinks
  md = md.replace(
    /^\[[^\]]+\]:\s*\S+(?:\s+"[^"]*"|\s+'[^']*'|\s+\([^)]*\))?/gm,
    protect,
  ); // 6. reference link definitions
  md = md.replace(/\]\(\s*[^)\s]+(?:\s+"[^"]*"|\s+'[^']*')?\s*\)/g, protect); // 7. link/image URLs
  md = md.replace(/<[a-zA-Z/][^>\n]*>/g, protect); // 8. inline HTML tags / autolinks

  md = smartifyText(md);

  for (const [key, value] of store) md = md.replaceAll(key, value);
  return md;
}

/**
 * Smartify HTML text nodes only — leaves tags/attributes untouched and skips
 * <style>/<script> blocks entirely. For hand-written HTML; generated pages
 * should smartify their Markdown source instead (see smartifyMarkdown).
 */
export function smartifyHtml(html) {
  const store = new Map();
  const protect = protector(store);

  html = html.replace(
    /<style[\s>][\s\S]*?<\/style>|<script[\s>][\s\S]*?<\/script>/gi,
    protect,
  );

  html = html
    .split(/(<[^>]*>)/)
    .map((part) => (part.startsWith('<') && part.endsWith('>') ? part : smartifyText(part)))
    .join('');

  for (const [key, value] of store) html = html.replaceAll(key, value);
  return html;
}
