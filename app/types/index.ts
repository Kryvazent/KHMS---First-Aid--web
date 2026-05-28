export type Language = "en" | "si" | "ta";

export type MultiLangText = {
  en: string;
  si: string;
  ta: string;
};

export type UserRole = "admin" | "staff";

export type AlertType = {
  id: number;
  type: string;
  type_si?: string | null;
  type_ta?: string | null;
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
  name_si?: string | null;
  name_ta?: string | null;
  province: string;
  latitude: number;
  longitude: number;
  radius_km: number;
};

export type SeverityLevel = {
  id: number;
  level: string;
  level_si?: string | null;
  level_ta?: string | null;
};

export type AlertRow = {
  id: number;
  created_at: string;
  title: string;
  title_si?: string | null;
  title_ta?: string | null;
  alert: string;
  alert_si?: string | null;
  alert_ta?: string | null;
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
  title_si?: string | null;
  title_ta?: string | null;
  instruction: string;
  instruction_si?: string | null;
  instruction_ta?: string | null;
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
  name_si?: string | null;
  name_ta?: string | null;
  severity_level_id: number;
  color: string | null;
  warning: string | null;
  warning_si?: string | null;
  warning_ta?: string | null;
  subtitle: string | null;
  subtitle_si?: string | null;
  subtitle_ta?: string | null;
  severity_level?: SeverityLevel;
  steps?: StepRow[];
};

export type UserRow = {
  id: number;
  created_at: string;
  name: string;
  username: string;
  password: string;
  role: "admin" | "staff";  
};

export type DeviceToken = {
  id: number;
  created_at: string;
  token: string;
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
  alert_id: number | null;
  title?: string | null;
  title_si?: string | null;
  title_ta?: string | null;
  message?: string | null;
  message_si?: string | null;
  message_ta?: string | null;
  success_count: number;
  failure_count: number;
  total_tokens: number;
  onesignal_id: string | null;
  error_message: string | null;
  alert?: {
    id: number;
    title: string;
    title_si?: string | null;
    title_ta?: string | null;
    alert: string;
    alert_si?: string | null;
    alert_ta?: string | null;
    send: boolean;
    alert_type?: { type: string; type_si?: string | null; type_ta?: string | null; color: string; icon: string };
  };
};