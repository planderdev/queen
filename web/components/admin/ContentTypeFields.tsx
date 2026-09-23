'use client';
import { useState } from 'react';
import type { Content } from '@/lib/data/types';

const types: [string, string][] = [['notice', '공지사항'], ['faq', 'FAQ'], ['story', '나눔 스토리'], ['news', '모금 소식'], ['banner', '홈 배너'], ['recommend', '추천 모금']];
const bodyLabel: Record<string, string> = { notice: '공지 본문', faq: '답변 내용', story: '스토리 본문', news: '소식 본문', banner: '배너 문구' };

export function ContentTypeFields({ item, fundraisers }: { item: Content | null; fundraisers: [string, string][] }) {
  const [type, setType] = useState<string>(item?.type ?? 'notice');
  return (
    <>
      <div className="field-grid">
        <label className="field"><span>콘텐츠 유형</span><select name="type" value={type} onChange={(e) => setType(e.target.value)}>{types.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="field"><span>제목</span><input name="title" defaultValue={item?.title ?? ''} required maxLength={100} /></label>
        {(type === 'notice' || type === 'story') && <label className="field"><span>슬러그 (URL)</span><input name="slug" defaultValue={item?.slug ?? ''} placeholder="비우면 제목에서 생성" /></label>}
        {type === 'faq' && <label className="field"><span>FAQ 분류</span><select name="category" defaultValue={item?.category ?? '기부'}>{['기부', '정기기부', '파트너', '기타'].map((c) => <option key={c} value={c}>{c}</option>)}</select></label>}
        {type === 'story' && <><label className="field"><span>스토리 분류</span><input name="category" defaultValue={item?.category ?? '나눔 소식'} /></label><label className="field"><span>대표 이미지 URL</span><input name="image" defaultValue={item?.image ?? '/assets/images/community.jpg'} /></label></>}
        {(type === 'news' || type === 'recommend') && <label className="field"><span>연결 모금함</span><select name="fundraiser_id" defaultValue={item?.fundraiser_id ?? ''} required><option value="">선택</option>{fundraisers.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></label>}
      </div>
      {type !== 'recommend' && <label className="field"><span>{bodyLabel[type]}</span><textarea name="body" rows={6} defaultValue={item?.body ?? ''} required maxLength={4000} /></label>}
      <label className="checkbox"><input type="checkbox" name="published" defaultChecked={item?.published ?? true} /> 저장 후 바로 공개</label>
    </>
  );
}
