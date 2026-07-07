// Convert straight quotes to curly ones in Markdown prose, in place.
//
//   node scripts/curly-quotes-md.mjs <file.md> [more.md ...]
//   node scripts/curly-quotes-md.mjs --dry-run <file.md>
//
// Skips code, frontmatter, links/URLs, and inline HTML — see smartifyMarkdown.
// Ported from curly-quotes_md.py.

import { runCli } from './lib/curly-cli.mjs';
import { smartifyMarkdown } from './lib/curly-quotes.mjs';

runCli('curly-quotes-md', smartifyMarkdown);
