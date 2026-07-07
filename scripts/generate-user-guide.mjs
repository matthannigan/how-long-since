// Generate public/user-guide.html from docs/USER_GUIDE.md.
//
// Standalone, run manually via `pnpm generate-user-guide` and committed —
// mirroring the generate-pwa-assets convention. NOT wired into build/dev, so
// the served page is a plain static file with no runtime tooling.
//
// What it does:
//   - renders the Markdown with marked (GFM), adding slugified ids to headings
//   - builds a Contents nav from the depth-2 headings
//   - rewrites image srcs from ../public/images/user-guide/ (GitHub-friendly)
//     to root-relative images/user-guide/ (served-page-friendly)
//   - wraps it in a self-contained, theme-aware HTML shell (Soft Daylight)
//
// Fails loudly (exit 1) if the Markdown is missing or references an image that
// isn't committed — the guardrail against committed-artifact drift.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { marked, Renderer } from 'marked';

import { smartifyMarkdown } from './lib/curly-quotes.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'docs/USER_GUIDE.md');
const OUT = resolve(ROOT, 'public/user-guide.html');
const IMAGE_PREFIX = '../public/'; // author-side prefix; the web root is public/

/** Kebab-case slug for heading anchors: lowercase, non-alphanumerics → hyphens. */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fail(message) {
  console.error(`generate-user-guide: ${message}`);
  process.exit(1);
}

if (!existsSync(SRC)) fail(`missing source Markdown at ${SRC}`);
// Smartify quotes in memory before rendering so the served page always has
// curly quotes, even if the source file hasn't been run through
// `pnpm curly-quotes` yet. (marked would otherwise escape straight quotes to
// &quot;/&#39; entities.)
const md = smartifyMarkdown(readFileSync(SRC, 'utf8'));

// --- Validate image references + collect TOC from the token stream -----------
const tokens = marked.lexer(md);
const toc = [];
const missingImages = [];
const seenImages = new Set();
let title = 'User Guide';

marked.walkTokens(tokens, (token) => {
  if (token.type === 'heading' && token.depth === 1) {
    title = token.text;
  }
  if (token.type === 'heading' && token.depth === 2) {
    toc.push({ text: token.text, id: slugify(token.text) });
  }
  if (token.type === 'image') {
    const href = token.href;
    if (href.startsWith(IMAGE_PREFIX)) {
      const rel = href.slice(IMAGE_PREFIX.length); // images/user-guide/x.png
      if (!seenImages.has(rel)) {
        seenImages.add(rel);
        if (!existsSync(resolve(ROOT, 'public', rel))) missingImages.push(rel);
      }
    }
  }
  if (token.type === 'link' && /\.md(#.*)?$/.test(token.href) && !/^https?:/.test(token.href)) {
    console.warn(
      `generate-user-guide: warning — relative link to "${token.href}" won't resolve on the served page`,
    );
  }
});

if (missingImages.length > 0) {
  fail(
    `these images are referenced but missing from public/ (run \`pnpm screenshots\`):\n  - ${missingImages.join('\n  - ')}`,
  );
}

// --- Render the body ----------------------------------------------------------
const renderer = new Renderer();

renderer.heading = function heading({ tokens: inline, depth, text }) {
  // Slug from the raw heading text (matches the TOC); render inline markdown
  // for the visible content.
  return `<h${depth} id="${slugify(text)}">${this.parser.parseInline(inline)}</h${depth}>\n`;
};

renderer.image = function image({ href, title, text }) {
  const src = href.startsWith(IMAGE_PREFIX) ? href.slice(IMAGE_PREFIX.length) : href;
  const titleAttr = title ? ` title="${title}"` : '';
  return `<img src="${src}" alt="${text}"${titleAttr} loading="lazy" />`;
};

// Render the body from the token stream minus the leading H1 — the title is
// promoted into the page header so it sits above the Contents nav. (`.filter`
// drops the token array's `.links` map, so restore it for reference links.)
const bodyTokens = tokens.filter((t) => !(t.type === 'heading' && t.depth === 1));
bodyTokens.links = tokens.links;
const body = marked.parser(bodyTokens, { gfm: true, renderer });

const tocHtml = toc
  .map((item) => `      <li><a href="#${item.id}">${item.text}</a></li>`)
  .join('\n');

// --- Compose the page ---------------------------------------------------------
// The pre-paint theme guard is copied verbatim from index.html (lines 16-29) —
// index.html is the source of truth. Same origin → the same `hls-prefs`
// localStorage mirror, so the guide honors the app's saved theme.
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#FAF8F4" />
    <meta name="description" content="How to use How Long Since." />
    <title>How Long Since — User Guide</title>
    <!--
      Generated from docs/USER_GUIDE.md — do not edit by hand.
      Run \`pnpm generate-user-guide\` to regenerate.
    -->
    <!-- Pre-paint theme guard, copied verbatim from index.html (source of truth). -->
    <script>
      (function () {
        try {
          var p = JSON.parse(localStorage.getItem('hls-prefs') || '{}');
          var el = document.documentElement;
          if (p.theme === 'light' || p.theme === 'dark') el.setAttribute('data-theme', p.theme);
          if (p.textSize && p.textSize !== 'default') el.setAttribute('data-text-size', p.textSize);
          if (p.highContrast) el.setAttribute('data-high-contrast', 'true');
          if (p.reducedMotion) el.setAttribute('data-reduced-motion', 'true');
        } catch (e) {
          /* storage unavailable — fall back to system theme */
        }
      })();
    </script>
    <style>
      :root {
        color-scheme: light;
        --page: #faf8f4;
        --card: #ffffff;
        --sunk: #efebe3;
        --border: #e4e0d8;
        --ink: #3a3330;
        --ink-meta: #6e675e;
        --accent: #d98c63;
        --accent-deep: #c0794c;
        --due-soon: #8a5e15;
        --overdue: #b2452f;
      }
      /* Dark, under both the OS media query and an explicit theme selector. */
      @media (prefers-color-scheme: dark) {
        :root:not([data-theme='light']):not(.light) {
          color-scheme: dark;
          --page: #24211d;
          --card: #2e2a25;
          --sunk: #302c27;
          --border: #37322c;
          --ink: #f3eee7;
          --ink-meta: #a69e93;
          --accent: #d98c63;
          --accent-deep: #e8875a;
          --due-soon: #e0a94e;
          --overdue: #f0876b;
        }
      }
      [data-theme='dark'],
      .dark {
        color-scheme: dark;
        --page: #24211d;
        --card: #2e2a25;
        --sunk: #302c27;
        --border: #37322c;
        --ink: #f3eee7;
        --ink-meta: #a69e93;
        --accent: #d98c63;
        --accent-deep: #e8875a;
        --due-soon: #e0a94e;
        --overdue: #f0876b;
      }
      html[data-text-size='large'] { font-size: 112.5%; }
      html[data-text-size='larger'] { font-size: 125%; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--page);
        color: var(--ink);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.65;
        -webkit-font-smoothing: antialiased;
      }
      .wrap { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
      .topbar { margin-bottom: 1.5rem; }
      .topbar a {
        color: var(--accent-deep);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9375rem;
      }
      .topbar a:hover { text-decoration: underline; }
      h1 { font-size: 2rem; line-height: 1.2; margin: 0.5rem 0 1rem; }
      h2 {
        font-size: 1.375rem;
        margin: 2.5rem 0 0.75rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
      }
      h3 { font-size: 1.125rem; margin: 1.75rem 0 0.5rem; }
      p { margin: 0.75rem 0; }
      a { color: var(--accent-deep); }
      strong { color: var(--ink); }
      ul, ol { padding-left: 1.5rem; }
      li { margin: 0.35rem 0; }
      code {
        background: var(--sunk);
        padding: 0.1rem 0.35rem;
        border-radius: 6px;
        font-size: 0.875em;
      }
      img {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 1.25rem auto;
        border: 1px solid var(--border);
        border-radius: 14px;
      }
      nav.toc {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1rem 1.25rem;
        margin: 1.5rem 0 2rem;
      }
      nav.toc p { margin: 0 0 0.5rem; font-weight: 700; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-meta); }
      nav.toc ul { margin: 0; padding-left: 1.1rem; }
      nav.toc a { text-decoration: none; }
      nav.toc a:hover { text-decoration: underline; }
      footer {
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
        color: var(--ink-meta);
        font-size: 0.875rem;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="topbar"><a href="/">← Back to How Long Since</a></div>
      <h1>${title}</h1>
      <nav class="toc" aria-label="Contents">
        <p>Contents</p>
        <ul>
${tocHtml}
        </ul>
      </nav>
      <main>
${body.trimEnd()}
      </main>
      <footer>
        <p>How Long Since — your data stays on your device.</p>
      </footer>
    </div>
  </body>
</html>
`;

writeFileSync(OUT, html);
console.log(`generate-user-guide: wrote ${OUT} (${toc.length} sections)`);
