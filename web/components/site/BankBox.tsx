import { CopyText } from './CopyText';
import { money } from '@/lib/format';

// 행사 참가비 입금 계좌 안내 (캠페인 details.bank)
export function BankBox({ bank, fee, capacity }: { bank: { bank: string; account: string; holder: string }; fee: number; capacity: number | null }) {
  return (
    <div className="bank-box">
      <p className="bank-box-label">참가비 입금 계좌{fee > 0 ? ` · ${money(fee)}` : ''}</p>
      <p className="bank-box-account"><span>{bank.bank}</span> <b>{bank.account}</b> <CopyText value={bank.account} label="계좌번호 복사" /></p>
      <p className="bank-box-holder">예금주 {bank.holder}</p>
      <ul className="bank-box-notes">
        <li>신청서에 적은 참가비 입금자명(없으면 성함)으로 입금해주세요.</li>
        <li>운영팀이 입금을 확인하면 참가가 확정됩니다.{capacity ? ` 입금 확인 순으로 선착순 ${capacity}명이 차면 신청이 마감됩니다.` : ''}</li>
      </ul>
    </div>
  );
}
