// Shared CLI harness for the curly-quote converters: reads each file argument,
// applies `transform`, and rewrites in place — or, with --dry-run, reports the
// per-file replacement count and each change's context without writing.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

/**
 * @param {string} name    program name, for the usage line
 * @param {(input: string) => string} transform  the smartify function to apply
 */
export function runCli(name, transform) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`Usage: node scripts/${name}.mjs <file> [file ...]`);
    console.log(`       node scripts/${name}.mjs --dry-run <file>`);
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');
  const files = args.filter((a) => a !== '--dry-run');

  for (const file of files) {
    const label = basename(file);
    if (!existsSync(file)) {
      console.log(`  SKIP ${label} (not found)`);
      continue;
    }

    const original = readFileSync(file, 'utf8');
    const converted = transform(original);

    if (original === converted) {
      console.log(`  SKIP ${label} (no changes)`);
      continue;
    }

    // Count differing characters (equal-length transform, so a positional zip).
    let count = 0;
    for (let i = 0; i < Math.min(original.length, converted.length); i++) {
      if (original[i] !== converted[i]) count += 1;
    }

    if (dryRun) {
      for (let i = 0; i < Math.min(original.length, converted.length); i++) {
        if (original[i] !== converted[i]) {
          const context = original.slice(Math.max(0, i - 20), i + 20).replace(/\n/g, '\\n');
          console.log(`  ${label}: '${original[i]}' → '${converted[i]}' in ...${context}...`);
        }
      }
      console.log(`  ${label}: ${count} replacements (dry run)`);
    } else {
      writeFileSync(file, converted, 'utf8');
      console.log(`  ${label}: ${count} replacements`);
    }
  }
}
