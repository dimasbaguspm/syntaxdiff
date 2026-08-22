// Custom writerOpts for @semantic-release/release-notes-generator /
// @semantic-release/changelog. The bundled `conventionalcommits` preset was
// emitting header-only CHANGELOG entries (no `### Features`/`### Bug Fixes`)
// for this repo, leaving every release since 1.5.3 an empty shell. This module
// forces type→section grouping so future releases always populate bodies.
export const writerOpts = {
  transform: (commit, _context) => {
    const discard = true;
    const entry = findType(commit.type);
    if (discard && (entry === undefined || (entry && entry.hidden))) {
      return undefined;
    }
    const type = entry ? entry.section : commit.type;
    let subject = commit.subject || commit.header || "";
    if (typeof subject === "string") {
      subject = subject.replace(/\(#\d+\)(\s*\(#\d+\))*\s*$/g, "").trim();
    }
    return {
      type,
      scope: commit.scope === "*" ? "" : commit.scope || "",
      subject,
      hash: commit.hash,
      shortHash: typeof commit.hash === "string" ? commit.hash.substring(0, 7) : commit.shortHash,
      references: commit.references || [],
      notes: commit.notes || [],
    };
  },
  groupBy: "type",
  commitGroupsSort: (a, b) => sectionRank(a.title) - sectionRank(b.title),
  commitsSort: ["scope", "subject"],
};

const SECTION_ORDER = ["Features", "Bug Fixes", "Performance Improvements", "Reverts", "Code Refactoring", "Documentation", "Tests", "Build System", "Continuous Integration", "Miscellaneous Chores"];

function sectionRank(title) {
  const i = SECTION_ORDER.indexOf(title);
  return i === -1 ? SECTION_ORDER.length : i;
}

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

function findType(type) {
  if (!type) return undefined;
  return TYPES.find((t) => t.type === String(type).toLowerCase());
}
