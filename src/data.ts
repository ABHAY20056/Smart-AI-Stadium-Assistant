import { StadiumZone, TransitStatus, StadiumFAQ, VolunteerTask, Incident } from './types';

export const INITIAL_ZONES: StadiumZone[] = [
  { id: 'gate-a', name: 'Gate A (North Entrance)', capacity: 15000, currentOccupancy: 12400, densityLevel: 'high', type: 'gate' },
  { id: 'gate-b', name: 'Gate B (East Entrance)', capacity: 18000, currentOccupancy: 6200, densityLevel: 'low', type: 'gate' },
  { id: 'gate-c', name: 'Gate C (South Entrance)', capacity: 15000, currentOccupancy: 14800, densityLevel: 'critical', type: 'gate' },
  { id: 'gate-d', name: 'Gate D (West Entrance)', capacity: 18000, currentOccupancy: 9500, densityLevel: 'medium', type: 'gate' },
  { id: 'concourse-n', name: 'North Concourse & Food Court', capacity: 10000, currentOccupancy: 9100, densityLevel: 'high', type: 'concourse' },
  { id: 'concourse-s', name: 'South Concourse Plaza', capacity: 12000, currentOccupancy: 4200, densityLevel: 'low', type: 'concourse' },
  { id: 'stands-n', name: 'North Stands (Supporters Section)', capacity: 20000, currentOccupancy: 19800, densityLevel: 'high', type: 'stands' },
  { id: 'stands-e', name: 'East General Stands', capacity: 25000, currentOccupancy: 21000, densityLevel: 'high', type: 'stands' },
  { id: 'stands-s', name: 'South Stands', capacity: 20000, currentOccupancy: 18500, densityLevel: 'high', type: 'stands' },
  { id: 'stands-w', name: 'West Premium Seating', capacity: 15000, currentOccupancy: 8200, densityLevel: 'medium', type: 'stands' },
  { id: 'transit-hub', name: 'Metrolink Train Station Hub', capacity: 15000, currentOccupancy: 13500, densityLevel: 'high', type: 'transit' },
  { id: 'rideshare-plaza', name: 'Rideshare Pickup Plaza West', capacity: 8000, currentOccupancy: 7600, densityLevel: 'high', type: 'transit' },
  { id: 'fan-zone', name: 'FIFA Fan Plaza & Concessions', capacity: 25000, currentOccupancy: 14000, densityLevel: 'medium', type: 'amenity' },
  { id: 'medical-center', name: 'Main Medical Wing (Concourse East)', capacity: 200, currentOccupancy: 15, densityLevel: 'low', type: 'amenity' },
];

export const INITIAL_TRANSIT: TransitStatus[] = [
  { id: 'metro-line-1', mode: 'metro', lineName: 'Metrolink Stadium Line', waitTime: 4, status: 'crowded', passengerLoad: 'heavy', advice: 'Trains running every 3 minutes. Heavy crowding after final whistle.' },
  { id: 'shuttle-a', mode: 'shuttle', lineName: 'Park & Ride Shuttle East', waitTime: 12, status: 'normal', passengerLoad: 'moderate', advice: 'Continuous shuttle loop to Lot E. Boarding at Plaza East.' },
  { id: 'shuttle-b', mode: 'shuttle', lineName: 'Downtown Express Shuttle', waitTime: 25, status: 'delayed', passengerLoad: 'overload', advice: 'Slight delays due to outer ring road traffic. Expect longer boarding queues.' },
  { id: 'rideshare-gate', mode: 'rideshare', lineName: 'Official Rideshare Zone (West)', waitTime: 18, status: 'crowded', passengerLoad: 'heavy', advice: 'Surge pricing in effect. Safe pickup lanes 1-6 fully staffed.' },
  { id: 'parking-lot-a', mode: 'parking', lineName: 'General Parking Lot A/B', waitTime: 35, status: 'crowded', passengerLoad: 'heavy', advice: 'Lot A is full. Incoming cars re-routed to Lot E or South Overflow.' },
];

export const INITIAL_VOLUNTEER_TASKS: VolunteerTask[] = [
  {
    id: 'task-1',
    taskName: 'Multilingual Gate C Support',
    duration: '3 hours',
    status: 'active',
    distribution: [
      { subZone: 'Gate C Entry Lanes', count: 4, role: 'Queue Marshall & Spanish Translator' },
      { subZone: 'Gate C Ticketing Booth', count: 2, role: 'Ticket Scanner Guide' }
    ],
    equipment: ['Megaphone', 'FIFA Volunteer Vest', 'Laminated Gate Map'],
    briefing: [
      'Manage spectator flow into Gate C ticketing lanes.',
      'Assist Spanish and French-speaking fans with ticket-scanning errors.',
      'Report scan failures exceeding 5% directly to Zone supervisor.'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    taskName: 'Wheelchair Assistance Patrol',
    duration: '4 hours',
    status: 'active',
    distribution: [
      { subZone: 'ADA Access Ramp East', count: 3, role: 'Accessibility Escort' },
      { subZone: 'Section 104 Concierge Desk', count: 2, role: 'Stands Assistant' }
    ],
    equipment: ['ADA Wheelchair (3x)', 'Radio Channel 4', 'Accessibility Badges'],
    briefing: [
      'Stagger patrols along main concourse entries.',
      'Provide manual assistance on ramp inclines.',
      'Escort guests to designated wheelchair seating bays.'
    ],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'incident-1',
    title: 'Gate C Turnstile Bottleneck',
    description: 'Ticket scanning error on terminal 4-8 is causing spectators to back up into the outer perimeter fence. Fans are becoming agitated due to heat.',
    location: 'Gate C (South Entrance)',
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    severity: 'high',
    status: 'mitigating',
    threatScore: 7,
    riskLevel: 'High',
    protocols: [
      'Open manual override pedestrian bypass gates to release outer fence pressure.',
      'Re-deploy 4 Ticketing Technicians to terminals 4-8 immediately.',
      'Assign 6 multilingual volunteers with megaphones to direct fans to adjacent Gate B (low crowd).'
    ],
    volunteerInstructions: 'Calm the crowd. Distribute water pouches. Guide fans speaking Spanish/French to less crowded entry lanes at Gate B.',
    crowdReroute: 'Redirect incoming shuttle bus drops from South Lot to East Gate B drop-off zone. Erect temporary crowd dividers at south concourse junction.',
    announcements: {
      en: 'Attention FIFA fans: We are experiencing minor entry delays at Gate C. For faster entry, please walk to Gate B located to your right. Multilingual helpers are on-site to guide you.',
      es: 'Atención aficionados de la FIFA: Estamos experimentando retrasos menores en la Puerta C. Para un ingreso más rápido, diríjase a la Puerta B a su derecha. Hay personal disponible para guiarle.',
      fr: 'Attention supporters de la FIFA : Nous rencontrons des retards à la Porte C. Pour une entrée plus rapide, veuillez vous diriger vers la Porte B à votre droite. Des guides sont là pour vous aider.'
    }
  }
];

export const STADIUM_FAQS: StadiumFAQ[] = [
  {
    id: 'faq-1',
    category: 'Ticketing & Entry',
    question: 'How do I transfer or show my digital ticket?',
    answer: 'Load your ticket in the FIFA Ticketing App before entering. Keep Bluetooth and NFC enabled. Screengrabs are NOT valid.',
    languages: {
      en: 'Load your ticket in the FIFA Ticketing App before entering. Keep Bluetooth and NFC enabled. Screengrabs are NOT valid.',
      es: 'Cargue su boleto en la aplicación de boletos de la FIFA antes de ingresar. Mantenga Bluetooth y NFC activados. Las capturas de pantalla NO son válidas.',
      fr: 'Chargez votre billet dans l\'application FIFA Ticketing avant d\'entrer. Activez le Bluetooth et le NFC. Les captures d\'écran ne sont PAS acceptées.'
    }
  },
  {
    id: 'faq-2',
    category: 'Prohibited Items',
    question: 'Can I bring water bottles or bags into the stadium?',
    answer: 'Only clear plastic bags up to 12x6x12 inches are allowed. No outside metal/glass bottles; clear empty plastic bottles under 20oz are permitted.',
    languages: {
      en: 'Only clear plastic bags up to 12x6x12 inches are allowed. No outside metal/glass bottles; clear empty plastic bottles under 20oz are permitted.',
      es: 'Solo se permiten bolsas de plástico transparentes de hasta 12x6x12 pulgadas. No se permiten botellas de metal o vidrio externas; se permiten botellas de plástico vacías de menos de 20 oz.',
      fr: 'Seuls les sacs en plastique transparents jusqu\'à 12x6x12 pouces sont autorisés. Les gourdes en métal/verre sont interdites ; les bouteilles plastiques vides <50cl sont tolérées.'
    }
  },
  {
    id: 'faq-3',
    category: 'Accessibility',
    question: 'Is there accessibility assistance for guests with mobility needs?',
    answer: 'Yes, ADA ramps are located at Gates A and C. Accessibility carts and volunteers can assist you at any Guest Concierge Desk.',
    languages: {
      en: 'Yes, ADA ramps are located at Gates A and C. Accessibility carts and volunteers can assist you at any Guest Concierge Desk.',
      es: 'Sí, las rampas ADA se encuentran en las Puertas A y C. Los carritos de accesibilidad y los voluntarios pueden ayudarlo en cualquier Mostrador de Conserjería.',
      fr: 'Oui, des rampes d\'accès PMR sont situées aux Portes A et C. Des voiturettes d\'assistance et des bénévoles sont disponibles aux bureaux d\'accueil.'
    }
  }
];
