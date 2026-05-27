import React from "react";
import {
  FaHeart, FaBrain, FaBone, FaTooth, FaEye, FaLungs,
  FaHandHoldingMedical, FaPills, FaSyringe, FaFirstAid,
  FaAmbulance, FaUserInjured, FaHeadSideCough, FaAllergies,
  FaFire, FaBolt, FaWater, FaSkull, FaBiohazard,
  FaRadiation, FaSnowflake, FaSun, FaCloudShowersHeavy,
  FaWind, FaHouseDamage, FaCarCrash,
  FaPhone, FaBell, FaExclamationTriangle, FaInfoCircle,
  FaCheckCircle, FaTimesCircle, FaQuestionCircle,
  FaShieldAlt, FaUsers, FaMapMarkerAlt, FaClock,
} from "react-icons/fa";
import {
  MdWarning, MdWarningAmber, MdError, MdInfo,
  MdNotifications, MdNotificationImportant, MdHealthAndSafety,
  MdMedicalServices, MdLocalHospital, MdEmergency,
  MdBloodtype, MdAir, MdMasks, MdSick,
  MdElectricBolt, MdLocalFireDepartment, MdFlood,
  MdTsunami, MdStorm, MdTornado,
  MdBlock, MdReportProblem, MdCampaign,
} from "react-icons/md";
import {
  GiSnake, GiSpiderWeb, GiScorpion,
  GiBrokenBone, GiBurningEye, GiPoisonBottle, GiNoseSide,
} from "react-icons/gi";
import {
  BsExclamationOctagonFill, BsLightningChargeFill,
  BsThermometerHigh, BsDropletHalf,
} from "react-icons/bs";

export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  // ─── Warnings ───
  warning_amber_rounded: MdWarningAmber,
  warning: MdWarning,
  error: MdError,
  info: MdInfo,
  notifications: MdNotifications,
  notification_important: MdNotificationImportant,
  campaign: MdCampaign,
  report_problem: MdReportProblem,
  block: MdBlock,
  exclamation: BsExclamationOctagonFill,

  // ─── Medical ───
  favorite: FaHeart,
  heart: FaHeart,
  bloodtype: MdBloodtype,
  bloodtype_outlined: MdBloodtype,
  brain: FaBrain,
  psychology: FaBrain,
  broken_bone: GiBrokenBone,
  bone: FaBone,
  tooth: FaTooth,
  eye: FaEye,
  lungs: FaLungs,
  air: MdAir,
  masks: MdMasks,
  sick: MdSick,
  cough: FaHeadSideCough,
  allergies: FaAllergies,
  nose: GiNoseSide,
  injured: FaUserInjured,

  // ─── Hospital ───
  local_hospital: MdLocalHospital,
  medical_services: MdMedicalServices,
  health_and_safety: MdHealthAndSafety,
  medication: FaPills,
  pills: FaPills,
  syringe: FaSyringe,
  first_aid: FaFirstAid,
  ambulance: FaAmbulance,
  emergency: MdEmergency,
  hand_medical: FaHandHoldingMedical,

  // ─── Disasters / Nature ───
  fire: FaFire,
  local_fire_department: MdLocalFireDepartment,
  bolt: FaBolt,
  electric_bolt: MdElectricBolt,
  lightning: BsLightningChargeFill,
  water: FaWater,
  water_drop: BsDropletHalf,
  flood: MdFlood,
  tsunami: MdTsunami,
  storm: MdStorm,
  tornado: MdTornado,
  earthquake: MdStorm,
  wind: FaWind,
  snowflake: FaSnowflake,
  sun: FaSun,
  thermostat: BsThermometerHigh,
  rain: FaCloudShowersHeavy,
  house_damage: FaHouseDamage,
  car_crash: FaCarCrash,

  // ─── Hazards / Animals ───
  skull: FaSkull,
  biohazard: FaBiohazard,
  radiation: FaRadiation,
  poison: GiPoisonBottle,
  snake: GiSnake,
  spider: GiSpiderWeb,
  scorpion: GiScorpion,
  burning_eye: GiBurningEye,

  // ─── General ───
  phone: FaPhone,
  bell: FaBell,
  exclamation_triangle: FaExclamationTriangle,
  info_circle: FaInfoCircle,
  check: FaCheckCircle,
  cancel: FaTimesCircle,
  help: FaQuestionCircle,
  shield: FaShieldAlt,
  users: FaUsers,
  location: FaMapMarkerAlt,
  clock: FaClock,
};

export function getIcon(name: string | null | undefined): React.ComponentType<{ size?: number; className?: string }> {
  if (!name) return MdWarningAmber;
  return ICON_MAP[name] ?? MdWarningAmber;
}

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const IconComponent = getIcon(name);
  return <IconComponent size={size} className={className} />;
}

export const ICON_OPTIONS = Object.keys(ICON_MAP);

export const POPULAR_ICONS = [
  "warning_amber_rounded", "favorite", "local_fire_department", "bolt",
  "medication", "psychology", "air", "broken_bone", "bloodtype",
  "water_drop", "thermostat", "snake", "fire", "ambulance",
  "first_aid", "skull", "biohazard", "tsunami", "flood",
  "electric_bolt", "lungs", "eye",
]; 