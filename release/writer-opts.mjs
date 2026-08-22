// release/writer-opts.mjs
// Custom writerOpts for @semantic-release/release-notes-generator +
// @semantic-release/changelog. Forces type→section grouping so CHANGELOG bodies
// populate (otherwise releases are header-only with no commit descriptions).
// Wire in .releaserc.json for BOTH plugins:
//   ["@semantic-release/release-notes-generator", { "preset": "conventionalcommits", "writerOpts": "./release/writer-opts.mjs" }]
//   ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md", "preset": "conventionalcommits", "writerOpts": "./release/writer-opts.mjs" }]

const TYPES = [
  { type: "feat", section: "Features", hidden: false },
  { type: "feature", section: "Features", hidden: false },
  { type: "fix", section: "Bug Fixes", hidden: false },
  { type: "perf", section: "Performance Improvements", hidden: false },
  { type: "revert", section: "Reverts", hidden: false },
  { type: "refactor", section: "Code Refactoring", hidden: true },
  { type: "docs", section: "Documentation", hidden: true },
  { type: "test", section: "Tests", hidden: true },
  { type: "build", section: "Build System", hidden: true },
  { type: "ci", section: "Continuous Integration", hidden: true },
  { type: "chore", section: "Miscellaneous Chores", hidden: true },
];

const SECTION_ORDER = [
  "Features", "Bug Fixes", "Performance Improvements", "Reverts",
  "Code Refactoring", "Documentation", "Tests", "Build System",
  "Continuous Integration", "Miscellaneous Chores",
];

const findType = (t) =>
  TYPES.find((x) => x.type === String(t ?? "").toLowerCase());
const rank = (title) => {
  const i = SECTION_ORDER.indexOf(title);
  return i === -1 ? SECTION_ORDER.length : i;
};

export const writerOpts = {
  transform: (commit, _context) => {
    const entry = findType(commit.type);
    if (entry === undefined || entry.hidden) return undefined;
    let subject = commit.subject || commit.header || "";
    if (typeof subject === "string") {
      subject = subject.replace(/\(#\d+\)(\s*\(#\d+\))*\s*$/g, "").trim();
    }
    return {
      type: entry.section,
      scope: commit.scope === "*" ? "" : commit.scope || "",
      subject,
      hash: commit.hash,
      shortHash:
        typeof commit.hash === "string"
          ? commit.hash.substring(0, 7)
          : commit.shortHash,
      references: commit.references || [],
      notes: commit.notes || [],
    };
  },
  groupBy: "type",
  commitGroupsSort: (a, b) => rank(a.title) - rank(b.title),
  commitsSort: ["scope", "subject"],
};
