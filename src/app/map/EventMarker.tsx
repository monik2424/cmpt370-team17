// Mark Betita
// mcb540
"use client";

import type { ComponentType } from "react";
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
  Trophy,
  Utensils,
  Palette,
  Sparkles,
  PartyPopper,
  Church,
  Joystick,
  BookIcon,
  Box,
} from "lucide-react";

interface EventMarkerProps {
  type: string; // normalized event type, e.g. "birthday", "concert", "food"
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  isTracking?: boolean;
}

type IconComponent = ComponentType<{ className?: string }>;

const iconMap: Record<string, IconComponent> = {
  // birthday / celebration focused
  birthday: Cake,

  // concert, recital, musical performance
  concert: Music,
  recital: Music,
  "musical performance": Music,
  "musical-performance": Music,

  // conference
  conference: Briefcase,

  // sports / gym / workout / exercise
  sports: Dumbbell,
  gym: Dumbbell,
  workout: Dumbbell,
  exercise: Dumbbell,

  // art / creative / generic “art”
  art: GraduationCap,

  // networking / meetups
  networking: Users,

  // movies, shows, etc.
  entertainment: Film,

  // social hangouts
  social: Coffee,

  // competitive events
  tournament: Trophy,

  // celebrations, anniversaries, special occasions
  celebration: PartyPopper,
  anniversary: PartyPopper,
  anniversaries: PartyPopper,
  "special occasion": PartyPopper,
  "special-occasion": PartyPopper,

  // food, tasting, dinner, culinary
  food: Utensils,
  tasting: Utensils,
  dinner: Utensils,
  culinary: Utensils,

  // artshow, exhibition, performance, cultural events
  artshow: Palette,
  exhibition: Palette,
  performance: Palette,
  "cultural event": Palette,
  "cultural-event": Palette,

  // seasonal, holiday
  seasonal: Sparkles,
  holiday: Sparkles,

  // community, local gatherings, church event
  community: Church,
  "local gathering": Church,
  "local-gathering": Church,
  "church event": Church,
  "church-event": Church,

  // tech / technology
  tech: Joystick,
  technology: Joystick,

  // education, academic, learning
  education: BookIcon,
  academic: BookIcon,
  learning: BookIcon,

  // fallback
  other: Box,
};

export default function EventMarker({
  type,
  size = "md",
  isActive = false,
  isTracking = false,
}: EventMarkerProps) {
  const normalizedType = type.toLowerCase();
  const Icon =
    iconMap[normalizedType] ??
    iconMap["other"] ??
    Users; // extra safety fallback

  const sizeClasses: Record<NonNullable<EventMarkerProps["size"]>, string> = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const iconSizes: Record<NonNullable<EventMarkerProps["size"]>, string> = {
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
