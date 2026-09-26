// 관리자 목록 공통: 상태 탭·검색·정렬 상태를 주소(searchParams)에서 읽고, 상태를 유지한 링크를 만든다.
export type ListParams = { tab?: string; q?: string; sort?: string; dir?: string; [k: string]: string | undefined };
export type SortDir = 'asc' | 'desc';

export function listState(base: string, sp: ListParams, defaults: { sort: string; dir: SortDir }, keep: Record<string, string | undefined> = {}) {
  const tab = sp.tab ?? '';
  const q = (sp.q ?? '').trim();
  const sort = sp.sort ?? defaults.sort;
  const dir: SortDir = sp.dir === 'asc' || sp.dir === 'desc' ? sp.dir : defaults.dir;
  const href = (patch: Partial<ListParams> = {}) => {
    const m: Record<string, string | undefined> = { ...keep, tab, q, sort, dir, ...patch };
    if (m.sort === defaults.sort && m.dir === defaults.dir) { delete m.sort; delete m.dir; }
    const qs = new URLSearchParams(Object.entries(m).filter((e): e is [string, string] => Boolean(e[1])));
    return qs.size ? `${base}?${qs}` : base;
  };
  return { tab, q, sort, dir, href };
}

// 문자열·숫자 모두 한국어 순서로 정렬 (값이 같으면 원래 순서 유지)
export function sortRows<T>(rows: T[], get: ((r: T) => string | number | null | undefined) | undefined, dir: SortDir): T[] {
  if (!get) return rows;
  return rows.map((r, i) => ({ r, i })).sort((a, b) => {
    const x = get(a.r) ?? '', y = get(b.r) ?? '';
    const d = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ko', { numeric: true });
    return (dir === 'asc' ? d : -d) || a.i - b.i;
  }).map(({ r }) => r);
}

export const includesQ = (q: string, ...values: (string | null | undefined)[]) => !q || values.some((v) => (v ?? '').toLowerCase().replace(/-/g, '').includes(q.toLowerCase().replace(/-/g, '')));
