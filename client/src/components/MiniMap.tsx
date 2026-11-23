/** Stylised map of a fictional street. Coded SVG, so no map API key is needed. */
export function MiniMap() {
  return (
    <div className="overflow-hidden rounded-card border border-outline/60 bg-sage-soft shadow-soft">
      <svg viewBox="0 0 480 320" role="img" aria-label="Map: Luna Café on Crescent Lane, near the river promenade" className="block h-auto w-full">
        <rect width="480" height="320" fill="#E4ECDC" />
        <path d="M0 250c80-20 160-10 240 10s160 20 240-5v65H0Z" fill="#C9DCE6" />
        <g stroke="#FFFDF8" strokeWidth="18" strokeLinecap="round" fill="none">
          <path d="M-10 120h500" />
          <path d="M150 -10v240" />
          <path d="M330 -10c-10 80 10 160 0 240" />
        </g>
        <g fill="#A9BBA0">
          <rect x="30" y="20" width="90" height="70" rx="14" />
          <rect x="180" y="20" width="120" height="70" rx="14" />
          <rect x="360" y="150" width="100" height="70" rx="14" />
          <rect x="30" y="150" width="90" height="60" rx="14" />
        </g>
        <text x="200" y="112" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill="#4A6B4F">Crescent Lane</text>
        <text x="40" y="290" fontFamily="DM Sans, sans-serif" fontSize="12" fontWeight="600" fill="#456277">Riverside promenade</text>
        <g transform="translate(240 160)">
          <circle r="26" fill="#294632" />
          <path d="M5-13a12 12 0 1 0 6 21A13.5 13.5 0 0 1 5-13Z" fill="#F6EFDF" />
          <path d="M-9 24 0 38 9 24" fill="#294632" />
        </g>
        <text x="274" y="166" fontFamily="Fredoka, sans-serif" fontSize="18" fontWeight="600" fill="#294632">Luna Café</text>
      </svg>
    </div>
  );
}
