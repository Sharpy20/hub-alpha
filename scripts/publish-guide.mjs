// Publish a guide downloaded from the editor (the 3.0 publishing route).
//
// An author writes or edits a guide in the editor, presses "Download to
// publish" and sends the file. The publisher runs:
//
//   npm run publish-guide -- path/to/downloaded.json [more.json ...]
//
// Each guide in the file is merged into src/lib/data/guides/published.json,
// replacing an earlier published copy with the same id. Then run the tests
// (npm test) and push: the published-guides test refuses a file that is not a
// valid guide or whose branching is broken, so a bad file stops at CI rather
// than reaching a reader.
//
// To take a published guide down: npm run publish-guide -- --remove <id>
//
// Checks here are the basics, so a wrong file fails with a clear message
// before anything is written. The full checks live in the test.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(repoRoot, "src", "lib", "data", "guides", "published.json");

const fail = (msg) => {
  console.error(`publish-guide: ${msg}`);
  process.exit(1);
};

const args = process.argv.slice(2);
if (args.length === 0) {
  fail("give it the file the editor downloaded, e.g. npm run publish-guide -- imha-advocacy.json");
}

const published = JSON.parse(fs.readFileSync(target, "utf8"));
if (!Array.isArray(published)) fail(`${target} should hold a list of guides`);

function save(list) {
  list.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(target, JSON.stringify(list, null, 2) + "\n");
}

if (args[0] === "--remove") {
  const ids = args.slice(1);
  if (ids.length === 0) fail("say which guide id to take down");
  const kept = published.filter((g) => !ids.includes(g.id));
  const gone = published.length - kept.length;
  if (gone === 0) fail(`none of ${ids.join(", ")} is published`);
  save(kept);
  console.log(`Taken down: ${ids.join(", ")}. The built-in version shows again where there is one.`);
  process.exit(0);
}

function check(g, file) {
  const where = `${file}${g && g.id ? ` (${g.id})` : ""}`;
  if (!g || typeof g !== "object") fail(`${where}: not a guide`);
  if (typeof g.id !== "string" || !/^[a-z0-9-]+$/.test(g.id)) fail(`${where}: the id must be lowercase letters, numbers and hyphens`);
  if (g.kind !== "guide" && g.kind !== "workflow") fail(`${where}: kind must be "guide" or "workflow"`);
  if (!g.look || typeof g.look.icon !== "string" || typeof g.look.category !== "string") fail(`${where}: missing its look (icon, colour, category)`);
  if (!g.data || g.data.id !== g.id) fail(`${where}: the guide's data id does not match its id`);
  if (typeof g.data.title !== "string" || !g.data.title.trim()) fail(`${where}: no title`);
  if (!Array.isArray(g.data.steps) || g.data.steps.length === 0) fail(`${where}: no steps`);
}

const incoming = [];
for (const file of args) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    fail(`could not read ${file}: ${e.message}`);
  }
  // The editor downloads a list, even for one guide. Accept a bare guide too.
  for (const g of Array.isArray(parsed) ? parsed : [parsed]) {
    check(g, path.basename(file));
    incoming.push(g);
  }
}

const ids = new Set(incoming.map((g) => g.id));
const next = [...published.filter((g) => !ids.has(g.id)), ...incoming];
save(next);

for (const g of incoming) {
  const before = published.some((p) => p.id === g.id);
  console.log(`Published: ${g.id} - "${g.data.title}"${before ? " (replaces the earlier published copy)" : ""}`);
}
console.log("Next: npm test, then commit and push. It is live once the deploy finishes.");
