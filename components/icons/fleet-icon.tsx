export function FleetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      {/* Fleet dashboard/network concept */}
      {/* Central hub/circle */}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      
      {/* Vehicles around the hub */}
      {/* Top vehicle */}
      <rect x="11" y="2" width="2" height="3" rx="0.5" fill="currentColor" />
      <rect x="10" y="5" width="4" height="1.5" rx="0.3" fill="currentColor" />
      
      {/* Right vehicle */}
      <rect x="17" y="11" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="14.5" y="10" width="1.5" height="4" rx="0.3" fill="currentColor" />
      
      {/* Bottom vehicle */}
      <rect x="11" y="19" width="2" height="3" rx="0.5" fill="currentColor" />
      <rect x="10" y="17.5" width="4" height="1.5" rx="0.3" fill="currentColor" />
      
      {/* Left vehicle */}
      <rect x="4" y="11" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="7" y="10" width="1.5" height="4" rx="0.3" fill="currentColor" />
      
      {/* Connection lines from vehicles to hub */}
      <line x1="12" y1="5.5" x2="12" y2="9.5" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="14.5" y1="12" x2="14.5" y2="12" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="12" y1="18.5" x2="12" y2="14.5" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="7" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      
      {/* Diagonal connections */}
      <line x1="13.4" y1="6.6" x2="14" y2="11" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      <line x1="14" y1="13" x2="13.4" y2="17.4" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      <line x1="10.6" y1="17.4" x2="10" y2="13" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      <line x1="10" y1="11" x2="10.6" y2="6.6" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
    </svg>
  );
}
