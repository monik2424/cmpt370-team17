"use client";

import { useState, useMemo, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxMap, { Marker, MapRef } from "react-map-gl/mapbox";
import EventMarker from "./EventMarker";
import EventPopup from "./EventPopup";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

// center camera roughly on downtown Saskatoon
const INITIAL_VIEW = {
  longitude: -106.67,
  latitude: 52.13,
  zoom: 13,
};

// Saskatoon events data
const saskatoonEvents = [
  {
    id: 1,
    title: "Sarah's Birthday Party",
    type: "birthday",
    date: "2025-10-15",
    time: "7:00 PM",
    location: "310 Wakabayashi Cres",
    attendees: 45,
    lat: 52.1844,
    lng: -106.6324,
    description: "Join us for a special celebration!",
    isTracking: true,
  },
  {
    id: 2,
    title: "River Landing Music Fest",
    type: "concert",
    date: "2025-10-20",
    time: "6:00 PM",
    location: "River Landing Amphitheatre",
    attendees: 2500,
    lat: 52.1235,
    lng: -106.6767,
    description: "Live performances by local bands on the riverfront.",
    isTracking: false,
  },
  {
    id: 3,
    title: "Prairie Tech Summit 2025",
    type: "conference",
    date: "2025-10-18",
    time: "9:00 AM",
    location: "TCU Place Convention Centre",
    attendees: 850,
    lat: 52.1276,
    lng: -106.6705,
    description: "Latest in technology and innovation on the prairies.",
    isTracking: true,
  },
  {
    id: 4,
    title: "Morning Yoga in the Park",
    type: "sports",
    date: "2025-10-12",
    time: "8:00 AM",
    location: "Kiwanis Memorial Park",
    attendees: 120,
    lat: 52.1339,
    lng: -106.6655,
    description: "Sunrise stretch and mindfulness by the river.",
    isTracking: false,
  },
  {
    id: 5,
    title: "Remai Modern Gallery Opening",
    type: "art",
    date: "2025-10-22",
    time: "5:00 PM",
    location: "Remai Modern",
    attendees: 300,
    lat: 52.1231,
    lng: -106.6779,
    description: "Contemporary art showcase and reception.",
    isTracking: true,
  },
  {
    id: 6,
    title: "Startup Founder Mixer",
    type: "networking",
    date: "2025-10-16",
    time: "6:30 PM",
    location: "Co.Labs Innovation Hub",
    attendees: 180,
    lat: 52.1304,
    lng: -106.6632,
    description: "Connect with Saskatoon founders and startup teams.",
    isTracking: false,
  },
  {
    id: 7,
    title: "Indie Film Night",
    type: "entertainment",
    date: "2025-10-19",
    time: "7:30 PM",
    location: "Broadway Theatre",
    attendees: 95,
    lat: 52.1208,
    lng: -106.6567,
    description: "Independent film screening and Q&A.",
    isTracking: true,
  },
  {
    id: 8,
    title: "Coffee & Code Meetup",
    type: "social",
    date: "2025-10-14",
    time: "10:00 AM",
    location: "City Perks Coffeehouse",
    attendees: 35,
    lat: 52.1352,
    lng: -106.6475,
    description: "Casual coding session with other devs.",
    isTracking: false,
  },
];

type Props = {
  user: {
    name?: string;
  };
};

// --- small internal component for zoom buttons ---
function MapControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="absolute right-4 top-4 z-40 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
      >
        <span className="text-lg leading-none font-medium">+</span>
      </button>
      <button
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
      >
        <span className="text-lg leading-none font-medium">−</span>
      </button>
    </div>
  );
}

export default function MapPageClient({ user }: Props) {
  // track active marker id
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);

  // ref to the map instance so we can imperatively zoom
  const [mapRef, setMapRef] = useState<MapRef | null>(null);

  const activeEvent = useMemo(
    () => saskatoonEvents.find((e) => e.id === activeMarkerId) ?? null,
    [activeMarkerId]
  );

  const handleMarkerClick = (id: number) => {
    setActiveMarkerId((prev) => (prev === id ? null : id));
  };

  // zoom handlers
  const handleZoomIn = useCallback(() => {
    if (!mapRef) return;
    mapRef.zoomIn({ duration: 200 });
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    if (!mapRef) return;
    mapRef.zoomOut({ duration: 200 });
  }, [mapRef]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Nav Bar */}
      <nav className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Saskatoon Events
              </h1>

              <div className="hidden space-x-4 md:flex">
                <a
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Dashboard
                </a>
                <a
                  href="/events"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Events
                </a>
                <a
                  href="/map"
                  className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white"
                >
                  Map
                </a>
              </div>
            </div>

            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header stats bar */}
      <header className="absolute left-0 right-0 top-16 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                EventFinder
              </h2>
              <p className="text-sm text-muted-foreground">
                Discover events in your area
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {saskatoonEvents.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {saskatoonEvents.filter((e) => e.isTracking).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Map section */}
      <main className="flex-1 pt-[7rem]">
        <div className="container mx-auto h-[calc(100vh-8rem)] px-6 pb-6">
          {!MAPBOX_TOKEN ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-muted-foreground text-sm text-muted-foreground">
              this is a test commit
            </div>
          ) : (
            <div className="relative h-full w-full">
              {/* The map itself */}
              <MapboxMap
                ref={(ref) => {
                  // react-map-gl gives us the MapRef instance here
                  // store it in state so our zoom buttons can use it
                  if (ref) setMapRef(ref);
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={INITIAL_VIEW}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                style={{ width: "100%", height: "100%" }}
              >
                {/* all markers */}
                {saskatoonEvents.map((event) => (
                  <Marker
                    key={event.id}
                    longitude={event.lng}
                    latitude={event.lat}
                    anchor="bottom"
                  >
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleMarkerClick(event.id)}
                        className="flex flex-col items-center focus:outline-none"
                      >
                        <EventMarker
                          type={event.type}
                          size="md"
                          isActive={activeMarkerId === event.id}
                          isTracking={event.isTracking}
                        />

                        {activeMarkerId === event.id && (
                          <p className="mt-1 max-w-[160px] rounded-md bg-white/90 px-2 py-1 text-center text-[11px] font-medium leading-snug text-black shadow dark:bg-black/90 dark:text-white">
                            {event.title}
                          </p>
                        )}
                      </button>
                    </div>
                  </Marker>
                ))}

                {/* floating popup card (top-left of map) */}
                {activeEvent && (
                  <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-xl">
                    <div className="pointer-events-auto">
                      <EventPopup
                        title={activeEvent.title}
                        description={activeEvent.description}
                        date={activeEvent.date}
                        time={activeEvent.time}
                        location={activeEvent.location}
                        attendees={activeEvent.attendees}
                        onClose={() => setActiveMarkerId(null)}
                      />
                    </div>
                  </div>
                )}
              </MapboxMap>

              {/* custom zoom controls overlayed on the map */}
              <MapControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
