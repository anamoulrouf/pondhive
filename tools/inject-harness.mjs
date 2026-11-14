// Inserts tools/harness.js (between markers) and the render-skip guard into a game file.
import fs from 'node:fs';
const harness = fs.readFileSync(new URL('./harness.js', import.meta.url), 'utf8');
for (const file of process.argv.slice(2)) {
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/\n<script>\/\* PH-HARNESS \*\/[\s\S]*?<\/script>/, '');
  s = s.replace('</body>', '<script>/* PH-HARNESS */\n' + harness + '</script>\n</body>');
  const guard = '  if (window.__phSkipRender) return;\n';
  const anchor = '  gl.clearColor(arenaBg[0], arenaBg[1], arenaBg[2], 1);';
  if (!s.includes(guard + anchor) && s.includes(anchor)) s = s.replace(anchor, guard + anchor);
  fs.writeFileSync(file, s);
  console.log('harness injected:', file, s.includes(guard) ? '(guard ok)' : '(NO GUARD — add manually)');
}
