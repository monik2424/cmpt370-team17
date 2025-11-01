// Mark Betita
// mcb540
"use client";

import { cn } from "@/lib/utils";
import {
  Cake,
  Music,
  Briefcase,
  Dumbbell,
  GraduationCap,
  Users,
  Film,
  Coffee,
} from "lucide-react";

interface EventMarkerProps {
  type: string;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  isTracking?: boolean;
}

const iconMap = {
  birthday: Cake,
  concert: Music,
  conference: Briefcase,
  sports: Dumbbell,
  art: GraduationCap,
  networking: Users,
  entertainment: Film,
  social: Coffee,
};

export default function EventMarker({
  type,
  size = "md",
  isActive = false,
  isTracking = false,
}: EventMarkerProps) {
  const Icon = iconMap[type as keyof typeof iconMap] || Users;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center justify-center rounded-full transition-all duration-200",
          sizeClasses[size],
          // Plain black marker (not using theme colors)
          "bg-black text-white hover:bg-gray-800 cursor-pointer",
          isActive && "ring-4 ring-yellow-400/40",
          isTracking && "ring-2 ring-yellow-400"
        )}
      >
        <Icon className={iconSizes[size]} />
      </div>

      {isActive && (
        <div className="absolute inset-0 rounded-full bg-yellow-400/40 animate-ping opacity-30" />
      )}
    </div>
  );
}
