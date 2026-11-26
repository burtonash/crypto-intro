// URL-addressable state (FR-S3, NFR-3): everything needed to reproduce a frame
// lives in the query string, e.g. ?stage=1&ratio=vertical&scene=break&text=HELLO&shift=3

export const RATIOS = {
  vertical: { w: 1080, h: 1920, label: '9:16' },
  square: { w: 1080, h: 1080, label: '1:1' },
  wide: { w: 1920, h: 1080, label: '16:9' },
};

export function readState(defaults = {}) {
  const q = new URLSearchParams(location.search);
  const flag = (k) => ['1', 'true', 'yes'].includes(q.get(k));
  return {
    ...defaults,
    ...Object.fromEntries([...q].filter(([k]) => k in defaults)),
    stage: flag('stage'),
    still: flag('still'),
    hud: q.get('hud') !== '0',
    guides: flag('guides'),
    ratio: RATIOS[q.get('ratio')] ? q.get('ratio') : 'vertical',
    scene: q.get('scene') || null,
  };
}

/** Update the address bar without a navigation or history entry. */
export function writeState(patch) {
  const q = new URLSearchParams(location.search);
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === false) q.delete(k); else q.set(k, v === true ? '1' : v);
  }
  history.replaceState(null, '', `${location.pathname}?${q}`);
}

export function stageUrl(params) {
  const q = new URLSearchParams({ stage: '1', ratio: 'vertical', ...params });
  return `?${q}`;
}
