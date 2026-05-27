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
  // joined
  alert_type?: AlertType;
  audience?: Audience;
  district?: District;
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