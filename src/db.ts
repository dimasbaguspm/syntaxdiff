import Dexie, { type Table } from "dexie";
import type { FormatOptions, LanguageId } from "./engine";

/** A saved diff, persisted in IndexedDB so results survive page jumps. */
export interface DiffRecord {
  id?: number;
  createdAt: number;
  lang: LanguageId;
  opts: FormatOptions;
  a: string;
  b: string;
  patch: string;
  added: number;
  removed: number;
}

class SyntaxDiffDB extends Dexie {
  diffs!: Table<DiffRecord, number>;

  constructor() {
    super("syntaxdiff");
    this.version(1).stores({ diffs: "++id, createdAt" });
  }
}

export const db = new SyntaxDiffDB();

export async function saveDiff(rec: Omit<DiffRecord, "id">): Promise<number> {
  return db.diffs.add(rec);
}

export async function getDiff(id: number): Promise<DiffRecord | undefined> {
  return db.diffs.get(id);
}

export async function listDiffs(): Promise<DiffRecord[]> {
  return db.diffs.orderBy("createdAt").reverse().toArray();
}

export async function deleteDiff(id: number): Promise<void> {
  return db.diffs.delete(id);
}

export async function clearDiffs(): Promise<void> {
  return db.diffs.clear();
}
