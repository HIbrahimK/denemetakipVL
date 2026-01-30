"use client";

import { useSchool } from "@/contexts/school-context";

interface SchoolLogoProps {
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

export default function SchoolLogo({ 
  className = "h-12 w-12", 
  showName = true,
  nameClassName = "text-xl font-bold"
}: SchoolLogoProps) {
  const { schoolName, schoolLogo } = useSchool();

  return (
    <div className="flex items-center gap-3">
      <img 
        src={schoolLogo} 
        alt={schoolName} 
        className={`object-contain drop-shadow-lg ${className}`}
        onError={(e) => {
          // Fallback to default logo if image fails to load
          (e.target as HTMLImageElement).src = "/LOGO.png";
        }}
      />
      {showName && (
        <span className={`tracking-tight ${nameClassName}`}>
          {schoolName}
        </span>
      )}
    </div>
  );
}
