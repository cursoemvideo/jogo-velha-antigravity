/**
 * Catálogo estático de avatares de mascotes para identificação dos jogadores.
 * Ilustrações SVG nativas, próprias e de uso livre, sem dependências externas.
 */

export const AVATARS = Object.freeze([
  Object.freeze({
    id: "robot",
    label: "Robô",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#E0F2FE"/>
      <line x1="32" y1="10" x2="32" y2="18" stroke="#0284C7" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="9" r="4" fill="#F59E0B"/>
      <rect x="16" y="18" width="32" height="28" rx="8" fill="#38BDF8" stroke="#0284C7" stroke-width="3"/>
      <rect x="11" y="26" width="5" height="12" rx="2" fill="#0284C7"/>
      <rect x="48" y="26" width="5" height="12" rx="2" fill="#0284C7"/>
      <circle cx="25" cy="30" r="4" fill="#FFFFFF"/>
      <circle cx="39" cy="30" r="4" fill="#FFFFFF"/>
      <circle cx="25" cy="30" r="2" fill="#0F172A"/>
      <circle cx="39" cy="30" r="2" fill="#0F172A"/>
      <rect x="23" y="38" width="18" height="4" rx="2" fill="#FFFFFF"/>
    </svg>`
  }),
  Object.freeze({
    id: "cat",
    label: "Gato",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#FEF3C7"/>
      <polygon points="16,28 18,12 28,22" fill="#F59E0B" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="48,28 46,12 36,22" fill="#F59E0B" stroke="#B45309" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="32" cy="35" r="16" fill="#FBBF24" stroke="#B45309" stroke-width="2.5"/>
      <circle cx="26" cy="33" r="2.8" fill="#1E293B"/>
      <circle cx="38" cy="33" r="2.8" fill="#1E293B"/>
      <polygon points="32,39 29,36 35,36" fill="#EC4899"/>
      <path d="M28 42 Q32 45 36 42" fill="none" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  }),
  Object.freeze({
    id: "fox",
    label: "Raposa",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#FFEDD5"/>
      <polygon points="15,28 17,11 29,21" fill="#EA580C"/>
      <polygon points="49,28 47,11 35,21" fill="#EA580C"/>
      <polygon points="14,34 32,18 50,34 32,51" fill="#F97316" stroke="#C2410C" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="18,35 32,51 28,36" fill="#FFFFFF"/>
      <polygon points="46,35 32,51 36,36" fill="#FFFFFF"/>
      <circle cx="25" cy="33" r="2.6" fill="#0F172A"/>
      <circle cx="39" cy="33" r="2.6" fill="#0F172A"/>
      <circle cx="32" cy="46" r="3" fill="#0F172A"/>
    </svg>`
  }),
  Object.freeze({
    id: "astronaut",
    label: "Astronauta",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#EDE9FE"/>
      <circle cx="32" cy="33" r="18" fill="#FFFFFF" stroke="#6D28D9" stroke-width="3"/>
      <rect x="19" y="23" width="26" height="17" rx="8.5" fill="#1E1B4B" stroke="#7C3AED" stroke-width="2.5"/>
      <path d="M23 27 Q28 24 34 26" fill="none" stroke="#A78BFA" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="32" r="2" fill="#FDE047"/>
      <rect x="25" y="44" width="14" height="4" rx="2" fill="#8B5CF6"/>
    </svg>`
  }),
  Object.freeze({
    id: "dino",
    label: "Dinossauro",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#DCFCE7"/>
      <polygon points="22,16 26,10 30,16" fill="#F59E0B"/>
      <polygon points="30,15 34,9 38,15" fill="#F59E0B"/>
      <polygon points="38,17 42,11 45,19" fill="#F59E0B"/>
      <rect x="17" y="16" width="30" height="30" rx="12" fill="#22C55E" stroke="#15803D" stroke-width="2.5"/>
      <circle cx="26" cy="28" r="3" fill="#FFFFFF"/>
      <circle cx="26" cy="28" r="1.6" fill="#0F172A"/>
      <circle cx="38" cy="28" r="3" fill="#FFFFFF"/>
      <circle cx="38" cy="28" r="1.6" fill="#0F172A"/>
      <path d="M24 38 Q32 43 40 38" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  }),
  Object.freeze({
    id: "unicorn",
    label: "Unicórnio",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#FCE7F3"/>
      <polygon points="32,7 27,22 37,22" fill="#FBBF24" stroke="#D97706" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="22" cy="21" r="5" fill="#EC4899"/>
      <circle cx="42" cy="21" r="5" fill="#8B5CF6"/>
      <circle cx="32" cy="36" r="15" fill="#FFFFFF" stroke="#DB2777" stroke-width="2.5"/>
      <circle cx="26" cy="34" r="2.6" fill="#1E293B"/>
      <circle cx="38" cy="34" r="2.6" fill="#1E293B"/>
      <path d="M27 42 Q32 46 37 42" fill="none" stroke="#DB2777" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  }),
  Object.freeze({
    id: "alien",
    label: "Alien",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#CCFBF1"/>
      <path d="M16 30 C16 16, 48 16, 48 30 C48 42, 38 51, 32 51 C26 51, 16 42, 16 30 Z" fill="#14B8A6" stroke="#0F766E" stroke-width="2.5"/>
      <ellipse cx="25" cy="31" rx="4.5" ry="6.5" transform="rotate(-15 25 31)" fill="#0F172A"/>
      <ellipse cx="39" cy="31" rx="4.5" ry="6.5" transform="rotate(15 39 31)" fill="#0F172A"/>
      <circle cx="24" cy="29" r="1.5" fill="#FFFFFF"/>
      <circle cx="38" cy="29" r="1.5" fill="#FFFFFF"/>
      <path d="M28 43 Q32 46 36 43" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`
  }),
  Object.freeze({
    id: "octopus",
    label: "Polvo",
    svg: `<svg viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#FFE4E6"/>
      <circle cx="32" cy="29" r="14" fill="#F43F5E" stroke="#BE123C" stroke-width="2.5"/>
      <circle cx="19" cy="43" r="4.5" fill="#F43F5E" stroke="#BE123C" stroke-width="2"/>
      <circle cx="27" cy="46" r="4.5" fill="#F43F5E" stroke="#BE123C" stroke-width="2"/>
      <circle cx="37" cy="46" r="4.5" fill="#F43F5E" stroke="#BE123C" stroke-width="2"/>
      <circle cx="45" cy="43" r="4.5" fill="#F43F5E" stroke="#BE123C" stroke-width="2"/>
      <circle cx="27" cy="28" r="2.8" fill="#FFFFFF"/>
      <circle cx="37" cy="28" r="2.8" fill="#FFFFFF"/>
      <circle cx="27" cy="28" r="1.4" fill="#0F172A"/>
      <circle cx="37" cy="28" r="1.4" fill="#0F172A"/>
      <path d="M28 34 Q32 38 36 34" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  })
]);

/**
 * Busca um avatar no catálogo pelo identificador único.
 * @param {string} id Identificador do avatar.
 * @returns {{id: string, label: string, svg: string} | null}
 */
export function getAvatarById(id) {
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  return AVATARS.find((avatar) => avatar.id === id) || null;
}
