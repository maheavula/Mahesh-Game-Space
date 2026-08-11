import fs from 'fs';
import path from 'path';

const games = [
  { filename: 'cs2.svg', title: 'COUNTER-STRIKE 2', bg: 'linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #0F172A 100%)', accent: '#8B5CF6', tag: 'TACTICAL SHOOTER', color: '#38BDF8' },
  { filename: 'dota2.svg', title: 'DOTA 2', bg: 'linear-gradient(135deg, #450A0A 0%, #180E29 50%, #090D16 100%)', accent: '#EF4444', tag: 'MOBA', color: '#F87171' },
  { filename: 'pubg.svg', title: 'PUBG BATTLEGROUNDS', bg: 'linear-gradient(135deg, #451A03 0%, #1C1917 50%, #0B0F19 100%)', accent: '#F97316', tag: 'BATTLE ROYALE', color: '#FDBA74' },
  { filename: 'apex.svg', title: 'APEX LEGENDS', bg: 'linear-gradient(135deg, #312E81 0%, #581C87 50%, #090D16 100%)', accent: '#C084FC', tag: 'HERO SHOOTER', color: '#A855F7' },
  { filename: 'marvel.svg', title: 'MARVEL RIVALS', bg: 'linear-gradient(135deg, #831843 0%, #1E1B4B 50%, #090D16 100%)', accent: '#EC4899', tag: 'TEAM SHOOTER', color: '#F472B6' },
  { filename: 'rust.svg', title: 'RUST', bg: 'linear-gradient(135deg, #2E1065 0%, #0F172A 50%, #172554 100%)', accent: '#6366F1', tag: 'SURVIVAL', color: '#818CF8' },
  { filename: 'gtav.svg', title: 'GTA V ENHANCED', bg: 'linear-gradient(135deg, #064E3B 0%, #022C22 50%, #090D16 100%)', accent: '#10B981', tag: 'OPEN WORLD', color: '#34D399' },
  { filename: 'stardew.svg', title: 'STARDEW VALLEY', bg: 'linear-gradient(135deg, #14532D 0%, #1E3A8A 50%, #0F172A 100%)', accent: '#22C55E', tag: 'FARMING RPG', color: '#4ADE80' },
  { filename: 'bg3.svg', title: "BALDUR'S GATE 3", bg: 'linear-gradient(135deg, #581C87 0%, #311042 50%, #090D16 100%)', accent: '#A855F7', tag: 'EPIC RPG', color: '#C084FC' },
  { filename: 'cyberpunk.svg', title: 'CYBERPUNK 2077', bg: 'linear-gradient(135deg, #701A75 0%, #1E1B4B 50%, #020617 100%)', accent: '#F43F5E', tag: 'CYBERPUNK RPG', color: '#FB7185' },
  { filename: 'eldenring.svg', title: 'ELDEN RING', bg: 'linear-gradient(135deg, #713F12 0%, #2A1208 50%, #090D16 100%)', accent: '#EAB308', tag: 'DARK FANTASY', color: '#FACC15' },
  { filename: 'witcher3.svg', title: 'THE WITCHER 3', bg: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)', accent: '#94A3B8', tag: 'MONSTER HUNTER RPG', color: '#CBD5E1' },
  { filename: 'rdr2.svg', title: 'RED DEAD REDEMPTION 2', bg: 'linear-gradient(135deg, #7C2D12 0%, #451A03 50%, #090D16 100%)', accent: '#EA580C', tag: 'WESTERN EPIC', color: '#FB923C' },
  { filename: 'forza.svg', title: 'FORZA HORIZON 6', bg: 'linear-gradient(135deg, #0284C7 0%, #0F172A 50%, #030712 100%)', accent: '#38BDF8', tag: 'RACING SIM', color: '#7DD3FC' },
  { filename: 'diablo4.svg', title: 'DIABLO IV', bg: 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 50%, #090D16 100%)', accent: '#DC2626', tag: 'ACTION RPG', color: '#F87171' },
  { filename: 'hades.svg', title: 'HADES', bg: 'linear-gradient(135deg, #991B1B 0%, #581C87 50%, #090D16 100%)', accent: '#F43F5E', tag: 'ROGUE-LIKE', color: '#FB7185' },
  { filename: 'hades2.svg', title: 'HADES II', bg: 'linear-gradient(135deg, #065F46 0%, #1E1B4B 50%, #090D16 100%)', accent: '#10B981', tag: 'ROGUE-LIKE SEQUEL', color: '#34D399' },
  { filename: 'skyrim.svg', title: 'SKYRIM SPECIAL ED', bg: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 50%, #020617 100%)', accent: '#60A5FA', tag: 'OPEN WORLD FANTASY', color: '#93C5FD' },
  { filename: 'default.svg', title: 'MAHESH GAME SPACE', bg: 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 50%, #070B17 100%)', accent: '#8B5CF6', tag: 'SIMULATOR CATALOG', color: '#A78BFA' }
];

function generateSvg(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#0F172A" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#070B17" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${item.accent}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
  </defs>
  <rect width="600" height="800" fill="#070B17"/>
  <rect width="600" height="800" fill="url(#bg)"/>
  <circle cx="300" cy="350" r="250" fill="url(#glow)" filter="url(#blur)"/>
  <!-- Decorative Futuristic Shapes -->
  <polygon points="300,120 480,240 480,480 300,600 120,480 120,240" fill="none" stroke="${item.accent}" stroke-width="2" stroke-opacity="0.3"/>
  <polygon points="300,160 440,260 440,460 300,560 160,460 160,260" fill="none" stroke="${item.color}" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="10 5"/>
  <circle cx="300" cy="360" r="90" fill="none" stroke="${item.accent}" stroke-width="3" stroke-opacity="0.6"/>
  <!-- Gaming Monogram Icon -->
  <path d="M 270 340 L 330 340 M 300 310 L 300 370 M 345 350 A 10 10 0 1 1 345 349 M 375 370 A 10 10 0 1 1 375 369" stroke="${item.color}" stroke-width="4" stroke-linecap="round" fill="none"/>
  
  <!-- Overlay Glass Gradient Card Bottom -->
  <rect x="30" y="600" width="540" height="160" rx="20" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5"/>
  
  <!-- Text Metadata -->
  <rect x="50" y="625" width="130" height="26" rx="6" fill="${item.accent}" fill-opacity="0.3" stroke="${item.accent}" stroke-opacity="0.6"/>
  <text x="115" y="642" font-family="'Outfit', sans-serif" font-weight="700" font-size="11" fill="${item.color}" text-anchor="middle" letter-spacing="1.5">${item.tag}</text>
  
  <text x="50" y="690" font-family="'Outfit', sans-serif" font-weight="800" font-size="28" fill="#FFFFFF" letter-spacing="0.5">${item.title}</text>
  <text x="50" y="730" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#94A3B8">MAHESH GAME SPACE SIMULATOR</text>
</svg>`;
}

const dir = path.resolve(process.cwd(), 'public/assets/games');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const item of games) {
  const filePath = path.join(dir, item.filename);
  fs.writeFileSync(filePath, generateSvg(item), 'utf-8');
}

console.log(`Generated ${games.length} SVG artwork files in public/assets/games/`);
