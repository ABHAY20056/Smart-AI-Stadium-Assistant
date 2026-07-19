export type Persona = 'fan' | 'organizer' | 'volunteer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StadiumZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  densityLevel: DensityLevel;
  type: 'gate' | 'concourse' | 'stands' | 'transit' | 'amenity';
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'mitigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  reportedAt: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  threatScore?: number;
  riskLevel?: string;
  protocols?: string[];
  volunteerInstructions?: string;
  crowdReroute?: string;
  announcements?: {
    en: string;
    es: string;
    fr: string;
  };
}

export interface VolunteerTask {
  id: string;
  taskName: string;
  duration: string;
  status: 'pending' | 'active' | 'completed';
  distribution: {
    subZone: string;
    count: number;
    role: string;
  }[];
  equipment: string[];
  briefing: string[];
  createdAt: string;
}

export interface TransitStatus {
  id: string;
  mode: 'shuttle' | 'metro' | 'rideshare' | 'parking';
  lineName: string;
  waitTime: number; // in minutes
  status: 'normal' | 'delayed' | 'crowded';
  passengerLoad: 'light' | 'moderate' | 'heavy' | 'overload';
  advice?: string;
}

export interface StadiumFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  languages: {
    en: string;
    es: string;
    fr: string;
  };
}
