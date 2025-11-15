// Mark Betita
// mcb540
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import EventMarker from "./EventMarker";

interface ClusterEvent {
  id: string;
  title: string;
  type: string;
  attendees: number;
  isTracking: boolean;
}

interface EventClusterProps {
  events: ClusterEvent[];
  isActive?: boolean;
  onEventClick: (event: ClusterEvent) => void;
}

export default function EventCluster({
  events,
  isActive = false,
  onEventClick,
}: EventClusterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (events.length === 0) return null;

  if (events.length === 1) {
    // Single event - render normal marker
    const event = events[0];
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        className="relative transition-all hover:scale-110"
      >
        <EventMarker
          type={event.type}
          size="lg"
          isActive={isActive}
          isTracking={event.isTracking}
        />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        </div>
      </button>
    );
  }

  // Multiple events - render cluster
  const hasTrackedEvent = events.some((e) => e.isTracking);

  return (
    <div className="relative">
      {!isExpanded ? (
        // Collapsed cluster bubble
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className={cn(
            "relative flex h-14 w-14 flex-col items-center justify-center rounded-full",
            "bg-black text-white shadow-xl border border-white/40",
            "transition-all hover:scale-110",
            hasTrackedEvent &&
              "ring-2 ring-primary ring-offset-2 ring-offset-background",
            isActive && "ring-4 ring-primary/30"
          )}
        >
          <span className="text-2xl font-bold">{events.length}</span>
          <span className="text-[10px] opacity-80">events</span>
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
          )}
        </button>
      ) : (
        // Expanded cluster showing all event icons
        <div className="relative">
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            ×
          </button>

          {/* Expanded event icons in a horizontal row */}
          <div className="flex max-w-[600px] items-center gap-2 rounded-full border-2 border-primary bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm scrollbar-thin scrollbar-track-background scrollbar-thumb-primary overflow-x-auto">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                className="flex-shrink-0 transition-all hover:scale-125"
                title={event.title}
              >
                <EventMarker
                  type={event.type}
                  size="md"
                  isActive={isActive && event.id === events[0].id}
                  isTracking={event.isTracking}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
