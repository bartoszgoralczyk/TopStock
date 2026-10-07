import "server-only";

import { execFile } from "node:child_process";

export const PAP_FEED_URL = "https://biznes.pap.pl/rss";

const MAX_ITEMS = 25;
const HOST = "biznes.pap.pl";
const SUCCESS_TTL_MS = 120_000;
const FAILURE_TTL_MS = 20_000;

type PapResult = { items: PapHeadline[]; unavailable: boolean };

let memory: { at: number; value: PapResult } | null = null;

export type PapHeadline = {
  id: string;
  title: string;
  href: string;
  time: number;
};

export async function loadPapHeadlines(): Promise<PapResult> {
  const now = Date.now();
  if (memory) {
    const ttl = memory.value.unavailable ? FAILURE_TTL_MS : SUCCESS_TTL_MS;
    if (now - memory.at < ttl) return memory.value;
  }
  const value = await loadFresh();
  memory = { at: now, value };
  return value;
}

async function loadFresh(): Promise<PapResult> {
  try {
    const xml = await readFeed();
    if (!xml.includes("<rss") || !xml.includes("<item")) {
      return { items: [], unavailable: true };
    }
    const items = parseHeadlines(xml);
    if (items.length === 0) return { items: [], unavailable: true };
    return { items, unavailable: false };
  } catch (error) {
    console.error("Kanał PAP niedostępny:", error);
    return { items: [], unavailable: true };
  }
}

function readFeed(): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "curl",
      [
        "-fsS",
        "--max-time",
        "8",
        "-A",
        "Mozilla/5.0 (compatible; GPWNotowania/1.0)",
        "-H",
        "Accept: application/rss+xml, application/xml, text/xml",
        PAP_FEED_URL,
      ],
      { maxBuffer: 1_000_000, timeout: 10_000 },
      (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      },
    );
  });
}

function parseHeadlines(xml: string): PapHeadline[] {
  const items: PapHeadline[] = [];
  const blocks = xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g);
  for (const match of blocks) {
    if (items.length >= MAX_ITEMS) break;
    const block = match[1];
    const title = textTag(block, "title");
    const link = textTag(block, "link");
    const published = textTag(block, "pubDate");
    if (!title || !link || !published) continue;
    let href: URL;
    try {
      href = new URL(link);
    } catch {
      continue;
    }
    if (href.protocol !== "https:" || href.hostname !== HOST) continue;
    const time = Date.parse(published);
    if (!Number.isFinite(time)) continue;
    const guid = textTag(block, "guid");
    items.push({
      id: guid || href.toString(),
      title,
      href: href.toString(),
      time: Math.floor(time / 1000),
    });
  }
  return items;
}

function textTag(block: string, name: string): string | null {
  const match = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`));
  if (!match) return null;
  const value = decodeXml(match[1]).replace(/\s+/g, " ").trim();
  return value || null;
}

function decodeXml(value: string): string {
  const withoutCdata = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  return withoutCdata
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, digits: string) => safeCodePoint(Number(digits)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, "&");
}

function safeCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}
