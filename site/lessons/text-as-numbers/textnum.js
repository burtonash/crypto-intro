// Arc 2 · Episode 7 — text as numbers: code points, UTF-8 bytes, and what goes
// wrong when two sides disagree about the representation.
const enc = new TextEncoder();

/** One row per character: the character, its Unicode code point and its UTF-8 bytes. */
export function chars(text) {
  return Array.from(text, (ch) => ({ ch, cp: ch.codePointAt(0), bytes: [...enc.encode(ch)] }));
}
export const utf8 = (text) => [...enc.encode(text)];
export const hex = (bytes) => bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
export const bin = (n) => n.toString(2).padStart(8, '0');
export const uplus = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

// Latin letters with Cyrillic twins that look the same in most fonts.
export const LOOKALIKES = { a: 'а', c: 'с', e: 'е', o: 'о', p: 'р', x: 'х', y: 'у', i: 'і', s: 'ѕ' };

/** Swap in look-alikes for the given Latin letters (default: just the first swappable one). */
export function spoof(word, { all = false } = {}) {
  let done = false;
  return Array.from(word, (ch) => {
    const twin = LOOKALIKES[ch];
    if (twin && (all || !done)) { done = true; return twin; }
    return ch;
  }).join('');
}

/** Characters outside plain ASCII, so a careful checker can flag them. */
export const nonAscii = (text) => chars(text).filter((c) => c.cp > 0x7f);

/** What a naive filter does: compare the visible text against a blocklist. */
export const naiveBlocked = (name, blocklist) => blocklist.includes(name.toLowerCase());

/** The other classic mix-up: UTF-8 bytes decoded as Windows-1252 ("mojibake"). */
export function mojibake(text) {
  return new TextDecoder('windows-1252').decode(new Uint8Array(utf8(text)));
}
