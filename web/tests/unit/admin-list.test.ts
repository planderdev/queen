import { describe, expect, it } from 'vitest';
import { includesQ, listState, sortRows } from '@/lib/admin-list';

describe('관리자 목록: 탭·검색·정렬 링크', () => {
  it('기본 정렬은 주소에서 생략하고 나머지 상태는 유지한다', () => {
    const s = listState('/admin/campaigns', { tab: 'pending', q: '홍' }, { sort: 'no', dir: 'asc' }, { id: 'c1' });
    expect(s.href()).toBe('/admin/campaigns?id=c1&tab=pending&q=%ED%99%8D');
    expect(s.href({ sort: 'name', dir: 'desc' })).toContain('sort=name&dir=desc');
  });
  it('잘못된 정렬 방향은 기본값으로 돌린다', () => {
    expect(listState('/x', { dir: 'sideways' }, { sort: 'no', dir: 'desc' }).dir).toBe('desc');
  });
  it('한국어·숫자 섞인 값을 자연스럽게 정렬하고, 같은 값은 원래 순서를 지킨다', () => {
    const rows = [{ n: '예약자 10' }, { n: '예약자 2' }, { n: '강명호' }, { n: '예약자 2', tag: 'second' }];
    expect(sortRows(rows, (r) => r.n, 'asc')).toEqual([{ n: '강명호' }, { n: '예약자 2' }, { n: '예약자 2', tag: 'second' }, { n: '예약자 10' }]);
  });
  it('검색은 대소문자·하이픈을 무시한다', () => {
    expect(includesQ('01012345678', '010-1234-5678')).toBe(true);
    expect(includesQ('RUNNER', 'runner@example.com')).toBe(true);
    expect(includesQ('없음', '홍길동', null)).toBe(false);
  });
});
