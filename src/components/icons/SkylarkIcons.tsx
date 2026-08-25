import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Skylark Brand Mark: A crisp geometric avian data-prism symbol
 * representing foresight, analytical velocity, and precision.
 */
export function SkylarkLogo({ className = "h-5 w-5", size, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 17.5L12 4L21 17.5L12 14.5L3 17.5Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M12 4L21 17.5L12 14.5V4Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
    </svg>
  );
}

/**
 * Skylark Intelligence Glyph: A refined precision data-aperture & neural compass.
 * Replaces generic AI sparkles with an authoritative enterprise intelligence mark.
 */
export function SkylarkIntelligenceIcon({
  className = "h-4 w-4",
  size,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      {/* Outer precision aperture */}
      <circle cx="12" cy="12" r="9" strokeWidth="1.75" strokeOpacity="0.5" />
      {/* Core directional nexus */}
      <path
        d="M12 3V7M12 17V21M3 12H7M17 12H21"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Executive Briefing Icon: Crisp editorial synthesis symbol
 */
export function ExecutiveBriefingIcon({
  className = "h-4 w-4",
  size,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
