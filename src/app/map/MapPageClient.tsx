"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxMap, { Marker, MapRef } from "react-map-gl/mapbox";
import EventMarker from "./EventMarker";
import EventPopup from "./EventPopup";
import { Box } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

const INITIAL_VIEW = {
  longitude: -106.67,
  latitude: 52.13,
  zoom: 13,
  bearing: 0,
  pitch: 0,
};

const saskatoonEvents = [
  {
    id: 1,
    title: "Naresh's Birthday Party",
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

function MapControls({
  onZoomIn,
  onZoomOut,
  onToggle3D,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggle3D: () => void;
}) {
  return (
    <div className="absolute right-4 top-4 z-40 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
      >
        +
      </button>

      <button
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
      >
        −
      </button>

      <button
        onClick={onToggle3D}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
        title="Toggle 3D"
      >
        <Box className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function MapPageClient({ user }: Props) {
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  const [is3D, setIs3D] = useState(false);

  // NEW: track user's location
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null); // NEW

  const mapRef = useRef<MapRef | null>(null);
  const setMapRef = useCallback((instance: MapRef | null) => {
    mapRef.current = instance;
  }, []);

  const activeEvent = useMemo(
    () => saskatoonEvents.find((e) => e.id === activeMarkerId) ?? null,
    [activeMarkerId]
  );

  const handleMarkerClick = (id: number) =>
    setActiveMarkerId((prev) => (prev === id ? null : id));

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 200 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 200 });
  }, []);

  type MaybeSymbolLayer = {
    id: string;
    type?: string;
    layout?: {
      ["text-field"]?: unknown;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };

  const add3DBuildingsLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    if (map.getLayer("3d-buildings")) return;

    const layers = map.getStyle().layers as MaybeSymbolLayer[];
    const labelLayerId = layers.find(
      (layer) =>
        layer.type === "symbol" &&
        layer.layout &&
        layer.layout["text-field"]
    )?.id;

    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.8,
        },
      },
      labelLayerId
    );
  }, []);

  const remove3DBuildingsLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (map.getLayer("3d-buildings")) {
      map.removeLayer("3d-buildings");
    }
  }, []);

  const handleToggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    setIs3D((prev) => {
      const going3D = !prev;

      if (going3D) {
        map.easeTo({
          pitch: 60,
          bearing: 45,
          duration: 500,
          essential: true,
        });
        add3DBuildingsLayer();
      } else {
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 500,
          essential: true,
        });
        remove3DBuildingsLayer();
      }

      return going3D;
    });
  }, [add3DBuildingsLayer, remove3DBuildingsLayer]);

  // keep 3D buildings alive across style changes
  useEffect(() => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) {
      return;
    }

    const handleStyleLoad = () => {
      if (is3D) {
        add3DBuildingsLayer();
      }
    };

    mapInstance.on("style.load", handleStyleLoad);

    return () => {
      mapInstance.off("style.load", handleStyleLoad);
    };
  }, [is3D, add3DBuildingsLayer]);

  // NEW: get user's location once and pan there
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // save user's location
        setUserLocation({
          lat: latitude,
          lng: longitude,
        });

        // optional UX: center map on them
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 800,
            essential: true,
          });
        }
      },
      (err) => {
        console.warn("User denied / position unavailable:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, []); // NEW

  const PAGE_SHELL_CLASSES =
    "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* NAVBAR */}
      <nav className="bg-[#1f2937] text-white shadow dark:bg-gray-800">
        <div className={PAGE_SHELL_CLASSES}>
          <div className="flex h-16 items-center justify-between">
            {/* left side */}
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-white">
                Saskatoon Events
              </h1>

              <div className="hidden space-x-4 md:flex">
                <a
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Dashboard
                </a>
                <a
                  href="/events"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Events
                </a>
                <a
                  href="/map"
                  className="rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Map
                </a>
              </div>
            </div>

            {/* right side */}
            <div className="flex items-center">
              <span className="text-sm text-gray-300">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* HEADER / STATS BAR */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm dark:bg-black">
        <div className={PAGE_SHELL_CLASSES + " py-4"}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground dark:text-white">
                EventFinder
              </h2>
              <p className="text-sm text-muted-foreground text-gray-500 dark:text-gray-400">
                Discover events in your area
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary text-white dark:text-white">
                    {saskatoonEvents.length}
                  </div>
                  <div className="text-xs text-muted-foreground text-gray-400">
                    Events
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-primary text-white dark:text-white">
                    {saskatoonEvents.filter((e) => e.isTracking).length}
                  </div>
                  <div className="text-xs text-muted-foreground text-gray-400">
                    Tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAP AREA */}
      <main className="flex flex-1 bg-gray-900/10 py-4 dark:bg-gray-900">
        <div className={PAGE_SHELL_CLASSES + " flex w-full"}>
          <div className="relative flex-1 rounded-md border border-border bg-black/5 shadow-sm dark:bg-black/20">
            {!MAPBOX_TOKEN ? (
              <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-muted-foreground text-sm text-muted-foreground">
                Missing Mapbox token
              </div>
            ) : (
              <div className="relative h-full w-full">
                <MapboxMap
                  ref={setMapRef}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={INITIAL_VIEW}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  style={{ width: "100%", height: "100%" }}
                >
                  {/* event markers */}
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

                  {/* NEW: user location marker */}
                  {userLocation && (
                    <Marker
                      longitude={userLocation.lng}
                      latitude={userLocation.lat}
                      anchor="center"
                    >
                      <div className="relative">
                        {/* pulsing aura */}
                        <span className="absolute inline-block h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 blur-[2px] animate-ping" />
                        {/* solid dot */}
                        <span className="relative inline-block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-md dark:border-gray-900" />
                      </div>
                    </Marker>
                  )}

                  {/* popup overlay */}
                  {activeEvent && (
                    <div className="pointer-events-none absolute top-4 left-0 z-30">
                      <div
                        className={
                          PAGE_SHELL_CLASSES +
                          " pointer-events-auto max-w-xl"
                        }
                      >
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

                <MapControls
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onToggle3D={handleToggle3D}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
