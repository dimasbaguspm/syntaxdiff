import Dexie, { type Table } from "dexie";
import type { DiffLine, FormatOptions, LanguageId } from "@/modules/engine/lib";

/** A saved diff, persisted in IndexedDB so results survive page jumps. */
export interface DiffRecord {
  id: string;
  createdAt: number;
  lang: LanguageId;
  opts: FormatOptions;
  a: string;
  b: string;
  patch: string;
  lines: DiffLine[];
  added: number;
  removed: number;
  /** Optional user-assigned source labels (default "Source A" / "Source B"). */
  labelA?: string;
  labelB?: string;
}

class SyntaxDiffDB extends Dexie {
  diffs!: Table<DiffRecord, string>;

  constructor() {
    super("syntaxdiff");
    this.version(1).stores({ diffs: "id, createdAt" });
  }
}

export const db = new SyntaxDiffDB();

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export async function saveDiff(rec: Omit<DiffRecord, "id">): Promise<string> {
  const id = newId();
  await db.diffs.add({ ...rec, id });
  return id;
}

export async function getDiff(id: string): Promise<DiffRecord | undefined> {
  return db.diffs.get(id);
}

export async function listDiffs(): Promise<DiffRecord[]> {
  return db.diffs.orderBy("createdAt").reverse().toArray();
}

export async function deleteDiff(id: string): Promise<void> {
  return db.diffs.delete(id);
}

export async function clearDiffs(): Promise<void> {
  return db.diffs.clear();
}
