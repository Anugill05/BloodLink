export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";
export type Component = "WHOLE_BLOOD" | "PRBC" | "PLATELETS" | "PLASMA";
export type Urgency = "CRITICAL" | "URGENT" | "PLANNED";
export type RequestStatus = "PENDING_VERIFICATION" | "OPEN" | "FULFILLED" | "CANCELLED" | "EXPIRED" | "REJECTED";
export type MatchStatus = "NOTIFIED" | "ACCEPTED" | "ARRIVED" | "DONATED" | "DECLINED" | "NO_SHOW" | "STOOD_DOWN";
export type Role = "DONOR" | "REQUESTER" | "HOSPITAL" | "ADMIN";

export interface LatLng { lat: number; lng: number }

export interface DonorProfile {
  blood_group: BloodGroup;
  date_of_birth: string | null;
  gender: string;
  weight_kg: number | null;
  max_travel_km: number;
  is_available: boolean;
  last_donation_date: string | null;
  notify_sms: boolean;
  notify_email: boolean;
  donations_count: number;
  alerts_received: number;
  alerts_accepted: number;
  next_eligible_date: string | null;
  is_eligible: boolean;
  reliability: number;
  lives_impacted: number;
  coordinates: LatLng | null;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  city: string;
  role: Role;
  hospital: { id: number; name: string; city: string; is_verified: boolean } | null;
  donor_profile: DonorProfile | null;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  has_blood_bank?: boolean;
  coordinates: LatLng | null;
  distance_km?: number | null;
}

export interface RequestMatch {
  id: number;
  blood_group: BloodGroup;
  distance_km: number;
  status: MatchStatus;
  wave: number;
  eta_minutes: number | null;
  notified_at: string;
  responded_at: string | null;
  donor_name: string | null;
  donor_phone: string | null;
}

export interface RequestEvent { kind: string; message: string; created_at: string }

export interface BloodRequest {
  id: string;
  code: string;
  hospital: Hospital;
  patient_name: string;
  patient_age: number | null;
  blood_group: BloodGroup;
  component: Component;
  component_label: string;
  units_needed: number;
  units_fulfilled: number;
  units_pledged: number;
  urgency: Urgency;
  needed_by: string;
  reason: string;
  contact_name: string;
  contact_phone: string;
  notes: string;
  status: RequestStatus;
  status_label: string;
  current_wave: number;
  search_radius_km: number;
  verified_at: string | null;
  created_at: string;
  stats: Record<MatchStatus | "total", number>;
  matches: RequestMatch[];
  events: RequestEvent[];
}

export interface RequestListItem {
  id: string;
  code: string;
  hospital_name: string;
  patient_name: string;
  blood_group: BloodGroup;
  component: Component;
  units_needed: number;
  units_fulfilled: number;
  units_pledged: number;
  urgency: Urgency;
  needed_by: string;
  status: RequestStatus;
  current_wave: number;
  search_radius_km: number;
  created_at: string;
  contact_name: string;
  contact_phone: string;
}

export interface PublicRequest {
  code: string;
  blood_group: BloodGroup;
  component: Component;
  component_label: string;
  units_needed: number;
  units_fulfilled: number;
  units_pledged: number;
  urgency: Urgency;
  needed_by: string;
  hospital_name: string;
  city: string;
  status: RequestStatus;
  created_at: string;
}

export interface DonorAlert {
  id: number;
  status: MatchStatus;
  distance_km: number;
  eta_minutes: number | null;
  notified_at: string;
  responded_at: string | null;
  request: {
    code: string;
    blood_group: BloodGroup;
    component: Component;
    component_label: string;
    units_needed: number;
    units_pledged: number;
    urgency: Urgency;
    needed_by: string;
    status: RequestStatus;
    reason: string;
    hospital: Hospital;
    patient_name?: string;
    contact_name?: string;
    contact_phone?: string;
    notes?: string;
  };
}

export interface Stats {
  donors: number;
  available_donors: number;
  verified_hospitals: number;
  open_requests: number;
  fulfilled_requests: number;
  units_donated: number;
  available_by_group: Record<BloodGroup, number>;
}

export interface Paginated<T> { count: number; results: T[] }
export interface Notification { id: number; kind: string; title: string; body: string; link: string; read_at: string | null; created_at: string }
