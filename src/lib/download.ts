/** Small browser download helpers shared by the JSON and CSV export paths. */

/** Trigger a client-side download of a Blob under the given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** `how-long-since-<kind>-YYYY-MM-DD.<ext>` — a dated, human-readable filename. */
export function backupFilename(ext: 'json' | 'csv', kind: 'backup' | 'tasks' = 'backup'): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  return `how-long-since-${kind}-${stamp}.${ext}`;
}
