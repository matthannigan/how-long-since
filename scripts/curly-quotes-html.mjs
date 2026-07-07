// Convert straight quotes to curly ones in HTML text nodes, in place.
//
//   node scripts/curly-quotes-html.mjs <file.html> [more.html ...]
//   node scripts/curly-quotes-html.mjs --dry-run <file.html>
//
// Skips tags/attributes and <style>/<script> blocks. Ported from
// curly-quotes_html.py. Note: the served user guide (public/user-guide.html) is
// generated and already curled by generate-user-guide — don't run this on it, as
// the next regeneration would overwrite any manual pass. This CLI is for
// hand-written HTML.

import { runCli } from './lib/curly-cli.mjs';
import { smartifyHtml } from './lib/curly-quotes.mjs';

runCli('curly-quotes-html', smartifyHtml);
