import type { Conference } from "../types/conference.ts";

export const conferences: Conference[] = [
  {
    id: "1",
    title: "IA en la Industria 2026",
    description: "Aplicaciones reales de la IA en empresas.",
    startTime: "2026-05-10T09:00:00",
    endTime: "2026-05-10T10:30:00",
    location: "Auditorio Paraninfo",
    category: "IA",
    level: "Intermedio",
    type: "presencial",
    year: 2026,
    dayId: "day1",
    documentUrl: "https://ejemplo.com/slides-ia",
    speaker: {
      name: "Laura Gómez",
      bio: "Ingeniera en Machine Learning",
      avatar: "https://i.pravatar.cc/150?u=laura",
      organization: "TechLab"
    }
  },
  {
    id: "2",
    title: "Ciberseguridad y Protección de Datos",
    description: "Estrategias avanzadas para proteger la información en la era digital.",
    startTime: "2026-05-10T11:00:00",
    endTime: "2026-05-10T12:30:00",
    location: "Auditorio Torres",
    category: "Seguridad",
    level: "Avanzado",
    type: "presencial",
    year: 2026,
    dayId: "day1",
    speaker: {
      name: "Andrés Martínez",
      bio: "Especialista en ciberseguridad y auditorías de sistemas",
      avatar: "https://i.pravatar.cc/150?u=andres",
      organization: "SecureTech"
    }
  },
  {
    id: "3",
    title: "Blockchain y Finanzas Descentralizadas",
    description: "Impacto de la tecnología blockchain en el sector financiero.",
    startTime: "2026-05-10T13:30:00",
    endTime: "2026-05-10T15:00:00",
    location: "Auditorio Sede 4 - Sala 1",
    category: "Blockchain",
    level: "Intermedio",
    type: "presencial",
    year: 2026,
    dayId: "day1",
    documentUrl: "https://ejemplo.com/blockchain-whitepaper",
    speaker: {
      name: "Carolina Ruiz",
      bio: "Consultora en tecnología financiera y blockchain",
      avatar: "https://i.pravatar.cc/150?u=carolina",
      organization: "FinTech Global"
    }
  },
  {
    id: "4",
    title: "Innovación en Robótica y Automatización",
    description: "Tendencias en robótica industrial y automatización de procesos.",
    startTime: "2026-05-10T15:30:00",
    endTime: "2026-05-10T17:00:00",
    location: "Virtual",
    category: "Robótica",
    level: "Avanzado",
    type: "virtual",
    year: 2026,
    dayId: "day1",
    virtualLink: "https://zoom.us/j/123456789",
    speaker: {
      name: "Diego Vargas",
      bio: "Ingeniero en robótica y automatización industrial",
      avatar: "https://i.pravatar.cc/150?u=diego",
      organization: "RoboWorks"
    }
  },
  {
    id: "5",
    title: "Desarrollo Sostenible y Tecnología",
    description: "Cómo la innovación tecnológica contribuye a la sostenibilidad.",
    startTime: "2026-05-11T09:00:00",
    endTime: "2026-05-11T10:30:00",
    location: "Auditorio Paraninfo",
    category: "Sostenibilidad",
    level: "Básico",
    type: "presencial",
    year: 2026,
    dayId: "day2",
    speaker: {
      name: "Mariana López",
      bio: "Investigadora en tecnologías sostenibles",
      avatar: "https://i.pravatar.cc/150?u=mariana",
      organization: "GreenTech"
    }
  },
  // Past Conferences
  {
    id: "6",
    title: "El Futuro del IoT",
    description: "Desafíos y oportunidades en Internet de las Cosas.",
    startTime: "2025-05-10T09:00:00",
    endTime: "2025-05-10T10:30:00",
    location: "Auditorio Principal",
    category: "IoT",
    level: "Intermedio",
    type: "presencial",
    year: 2025,
    dayId: "day1",
    speaker: {
      name: "Jorge Ramírez",
      bio: "Experto en IoT y Sistemas Embebidos",
      avatar: "https://i.pravatar.cc/150?u=jorge",
      organization: "IoT Solutions"
    }
  },
  {
    id: "7",
    title: "Realidad Aumentada en Educación",
    description: "Nuevas formas de enseñar usando AR y VR.",
    startTime: "2024-05-12T14:00:00",
    endTime: "2024-05-12T15:30:00",
    location: "Virtual",
    category: "Educación",
    level: "Básico",
    type: "virtual",
    year: 2024,
    dayId: "day2",
    virtualLink: "https://zoom.us/j/987654321",
    speaker: {
      name: "Elena Suárez",
      bio: "Diseñadora de Experiencias Educativas",
      avatar: "https://i.pravatar.cc/150?u=elena",
      organization: "EdTech Innovations"
    }
  }
];
