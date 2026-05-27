export type Language = "en" | "si" | "ta";

export type MultiLangText = {
  en: string;
  si: string;
  ta: string;
};

export type AlertType = {
  id: number;
  type: string;
  color: string;
  icon: string;
};

export type Audience = {
  id: number;
  audience: string;
};

export type District = {
  id: number;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  radius_km: number;
};

export type SeverityLevel = {
  id: number;
  level: string;
};

export type AlertRow = {
  id: number;
  created_at: string;
  title: string;
  alert: string;
  alert_type_id: number;
  audience_id: number;
  send: boolean;
  added_by: number;
  url: string | null;
  district_id: number | null;
  alert_type?: AlertType;
  audience?: Audience;
  district?: District;
};

export type StepRow = {
  id: number;
  step_id: number;
  title: string;
  instruction: string;
  image_url: string | null;
  video_url: string | null;
  emergency_id: number;
  icon: string | null;
};

export type EmergencyRow = {
  id: number;
  created_at: string;
  icon: string;
  name: string;
  severity_level_id: number;
  color: string | null;
  warning: string | null;
  subtitle: string | null;
  severity_level?: SeverityLevel;
  steps?: StepRow[];
};

export type UserRow = {
  id: number;
  created_at: string;
  name: string;
  username: string;
  password: string;
};

export type DeviceToken = {
  id: number;
  created_at: string;
  player_id: string;
  platform: string;
  language: string;
  district_id: number | null;
  last_active: string | null;
  is_active: boolean;
  district?: { id: number; name: string };
};

export type NotificationLog = {
  id: number;
  created_at: string;
  alert_id: number;
  success_count: number;
  failure_count: number;
  total_tokens: number;
  onesignal_id: string | null;
  error_message: string | null;
  alert?: {
    id: number;
    title: string;
    alert: string;
    send: boolean;
    alert_type?: { type: string; color: string; icon: string };
  };
};