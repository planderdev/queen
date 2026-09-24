// Domain types shared by the Supabase repository and the in-memory seed repository.
export type ReviewStatus = 'draft' | 'submitted' | 'reviewing' | 'revision' | 'approved' | 'rejected';
export type PublicationStatus = 'scheduled' | 'active' | 'paused' | 'ended';
export type DonationStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
export type DonationKind = 'donation' | 'recurring' | 'refund';
export type PlanStatus = 'active' | 'paused' | 'cancelled';
export type CampaignType = 'matching' | 'cheer' | 'event';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';
export type ContentType = 'notice' | 'faq' | 'story' | 'news' | 'banner' | 'recommend';
export type RequestStatus = 'requested' | 'approved' | 'rejected' | 'resolved';
export type AdminRole = 'super' | 'content' | 'review' | 'finance';

export interface Organization {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string | null;
  status: ReviewStatus;
  created_at: string;
}

export interface BudgetItem { label: string; amount: number }

export interface Fundraiser {
  id: string;
  slug: string;
  organization_id: string;
  title: string;
  story: string;
  image: string | null;
  category: string;
  region: string;
  target: number;
  start_at: string;
  end_at: string;
  budget: BudgetItem[];
  review: ReviewStatus;
  publication: PublicationStatus;
  reason: string | null;
  created_at: string;
}

export interface FundraiserStats { fundraiser_id: string; direct: number; matching: number; donors: number; paid: number }

export interface FundraiserCard extends Fundraiser {
  organization: Pick<Organization, 'id' | 'slug' | 'name'>;
  stats: FundraiserStats;
}

export interface PublicDonation {
  id: string;
  fundraiser_id: string;
  amount: number;
  anonymous: boolean;
  message: string;
  created_at: string;
  donor_name: string | null;
}

export interface Donation {
  id: string;
  number: string;
  user_id: string | null;
  fundraiser_id: string | null;
  organization_id: string | null;
  plan_id: string | null;
  kind: DonationKind;
  amount: number;
  status: DonationStatus;
  method: string;
  depositor_name: string | null;
  anonymous: boolean;
  message: string;
  original_id: string | null;
  confirmed_at: string | null;
  created_at: string;
  fundraiser?: Pick<Fundraiser, 'id' | 'slug' | 'title'> | null;
  organization?: Pick<Organization, 'id' | 'slug' | 'name'> | null;
}

export interface RecurringPlan {
  id: string;
  user_id: string;
  organization_id: string;
  amount: number;
  day: number;
  next_date: string;
  status: PlanStatus;
  created_at: string;
  organization?: Pick<Organization, 'id' | 'slug' | 'name'> | null;
}

export interface Campaign {
  id: string;
  slug: string;
  partner_name: string;
  title: string;
  description: string;
  type: CampaignType;
  fundraiser_id: string | null;
  limit_amount: number;
  rate: number;
  image: string | null;
  review: ReviewStatus;
  start_at: string;
  end_at: string;
  created_at: string;
  details: CampaignDetails;      // 행사(event) 캠페인 안내 문구
  fee_amount: number;            // 참가비 (0 = 무료·미정)
  registration_open: boolean;
  capacity: number | null;
  registration_count?: number;   // 트리거로 유지되는 유효 신청 수
  participations?: number;
  registrations?: number;
}

export interface CampaignDetails {
  intro?: string;
  event_name?: string;
  schedule?: string;
  course?: string;
  benefits?: string[];
  agreements?: string[];
  complete?: string;
}

export interface CampaignRegistration {
  id: string;
  campaign_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string;
  gender: string | null;
  age_group: string | null;
  depositor_name: string | null;
  agreements: string[];
  status: RegistrationStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  slug: string | null;
  type: ContentType;
  title: string;
  body: string;
  category: string | null;
  image: string | null;
  fundraiser_id: string | null;
  published: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  fundraiser_id: string;
  user_id: string;
  body: string;
  hidden: boolean;
  created_at: string;
  author_name?: string | null;
}

export interface Bookmark { id: string; user_id: string; target_type: 'fundraiser' | 'story' | 'campaign' | 'organization'; target_id: string; created_at: string }

export interface Inquiry {
  id: string;
  user_id: string | null;
  email: string | null;
  category: string;
  title: string;
  body: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
}

export interface Notification { id: string; user_id: string; text: string; href: string | null; read: boolean; created_at: string }

export interface Profile {
  id: string;
  email: string | null;
  name: string;
  role: 'donor' | 'admin';
  admin_role: AdminRole | null;
  interests: string[];
  is_public: boolean;
  suspended: boolean;
  created_at: string;
}

export interface RefundRequest {
  id: string;
  donation_id: string;
  user_id: string;
  reason: string;
  status: RequestStatus;
  review_reason: string | null;
  created_at: string;
  donation?: Pick<Donation, 'id' | 'number' | 'amount' | 'created_at'> | null;
}

export interface AuditLog { id: string; actor_id: string | null; action: string; target_type: string | null; target_id: string | null; detail: unknown; created_at: string; actor_name?: string | null }

export interface Settings { categories: string[]; regions: string[]; bank: { holder: string; bank: string; account: string } }

export interface FundraiserFilter {
  q?: string;
  category?: string;
  region?: string;
  org?: string;
  status?: '' | 'active' | 'ended';
  sort?: 'recommended' | 'new' | 'ending' | 'popular';
  page?: number;
  size?: number;
}

export interface ListPage<T> { items: T[]; total: number; page: number; pages: number }
