/** Toolbar icon set — 24x24 viewBox, stroke-based, sized by the caller. */

type IconProps = { size?: number };

function Svg({ size = 16, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SelectIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 3l7 19 2-8 8-2z" />
    </Svg>
  );
}
export function TextIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 6V4h16v2" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </Svg>
  );
}
export function PenIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}
export function HighlightIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 11l-6 6v3h3l6-6" />
      <path d="M13 5l6 6-2 2-6-6z" />
    </Svg>
  );
}
export function LinkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 17H7A5 5 0 017 7h2" />
      <path d="M15 7h2a5 5 0 010 10h-2" />
      <path d="M8 12h8" />
    </Svg>
  );
}
export function ImageIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </Svg>
  );
}
export function WhiteoutIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 7h10v10H7z" />
    </Svg>
  );
}
export function ShapesIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8" r="5" />
      <rect x="13" y="13" width="8" height="8" />
    </Svg>
  );
}
export function EllipseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <ellipse cx="12" cy="12" rx="9" ry="6" />
    </Svg>
  );
}
export function RectangleIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="6" width="18" height="12" rx="1" />
    </Svg>
  );
}
export function LineIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20L20 4" />
    </Svg>
  );
}
export function ArrowIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20L20 4" />
      <path d="M20 4v7" />
      <path d="M20 4h-7" />
    </Svg>
  );
}
export function UndoIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-15-6.7L3 13" />
    </Svg>
  );
}
export function RedoIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0115-6.7L21 13" />
    </Svg>
  );
}
export function ChevronDownIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}
export function DuplicateIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M4 16V4a1 1 0 011-1h12" />
    </Svg>
  );
}
export function TrashIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
      <path d="M19 6l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6" />
    </Svg>
  );
}
export function MoveIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v18M3 12h18" />
      <path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3" />
    </Svg>
  );
}
export function SignIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 17s2-1 4-1 3 1.5 5 1.5S16 16 18 16s3 1 3 1" />
      <path d="M6 13c1-4 3-9 5-9s1 6-1 9 4 1 6-2" />
    </Svg>
  );
}
export function AnnotateIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 19h4l10-10a2.121 2.121 0 00-3-3L5 16v3z" />
      <path d="M3 21h18" />
    </Svg>
  );
}
export function StrikeoutIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 12h12" />
      <path d="M8 7c0-1.5 1.5-3 4-3s4 1 4 2.5" />
      <path d="M8 17c0 1.5 1.5 3 4 3s4-1.5 4-3" />
    </Svg>
  );
}
export function UnderlineIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 4v7a6 6 0 0012 0V4" />
      <path d="M4 20h16" />
    </Svg>
  );
}
export function EyeIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
export function FormsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </Svg>
  );
}
export function FindIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Svg>
  );
}
export function GridIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}
export function DropdownFieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M15 12l2 2 2-2" />
    </Svg>
  );
}
export function CheckboxFieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12l3 3 6-6" />
    </Svg>
  );
}
export function RadioFieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}
export function MultilineFieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10" />
      <path d="M7 13h10" />
      <path d="M7 17h6" />
    </Svg>
  );
}
export function EyeOffIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.4 10.4 0 0112 5c6 0 10 7 10 7a17.5 17.5 0 01-3.2 3.9M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7a9.6 9.6 0 004.9-1.3" />
      <path d="M9.5 9.5a3 3 0 004.2 4.2" />
    </Svg>
  );
}
