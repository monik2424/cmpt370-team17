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

// Center roughly on downtown Saskatoon
const INITIAL_VIEW = {
  longitude: -106.67,
  latitude: 52.13,
  zoom: 13,
  bearing: 0,
  pitch: 0,
};

// Saskatoon events data
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

// Zoom / 3D control buttons
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
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
      >
        <span className="text-lg font-medium leading-none">+</span>
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f1115] text-white shadow-lg ring-1 ring-white/10 hover:bg-[#1a1d24] active:scale-[0.97]"
      >
        <span className="text-lg font-medium leading-none">−</span>
      </button>

      {/* 3D Toggle */}
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
  // which event pin is "active"
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);

  // are we in tilted 3D mode
  const [is3D, setIs3D] = useState(false);

  // ref to Mapbox map instance (NOT React state anymore)
  const mapRef = useRef<MapRef | null>(null);

  // callback ref passed to <MapboxMap ref={...}/>
  const setMapRef = useCallback((instance: MapRef | null) => {
    mapRef.current = instance;
  }, []);

  // derive the full active event
  const activeEvent = useMemo(
    () => saskatoonEvents.find((e) => e.id === activeMarkerId) ?? null,
    [activeMarkerId]
  );

  // marker click toggles popup
  const handleMarkerClick = (id: number) => {
    setActiveMarkerId((prev) => (prev === id ? null : id));
  };

  // zoom handlers
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 200 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 200 });
  }, []);

  // Add 3D buildings layer under label layer
  const add3DBuildingsLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    // Don't add twice
    if (map.getLayer("3d-buildings")) return;

    // Type for just the fields we care about in style layers
    type MaybeSymbolLayer = {
      id: string;
      type?: string;
      layout?: {
        ["text-field"]?: unknown;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };

    const layers = map.getStyle().layers as MaybeSymbolLayer[];

    // Find first symbol layer that uses text, so we can insert below it
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

  // Remove 3D buildings layer
  const remove3DBuildingsLayer = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (map.getLayer("3d-buildings")) {
      map.removeLayer("3d-buildings");
    }
    // Mapbox's "composite" source stays; we don't touch it
  }, []);

  // Toggle 3D camera + extrusion layer
  const handleToggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    setIs3D((prev) => {
      const going3D = !prev;

      if (going3D) {
        // enter 3D: tilt & rotate camera, add extruded buildings
        map.easeTo({
          pitch: 60,
          bearing: 45,
          duration: 500,
          essential: true,
        });
        add3DBuildingsLayer();
      } else {
        // exit 3D: reset camera, remove extruded buildings
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

  // If style reloads while in 3D, re-add extrusion layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    const handleStyleLoad = () => {
      if (is3D) {
        add3DBuildingsLayer();
      }
    };

    map.on("style.load", handleStyleLoad);
    return () => {
      map.off("style.load", handleStyleLoad);
    };
  }, [is3D, add3DBuildingsLayer]);

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

      {/* Header stats */}
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
                  <div className="text-xs text-muted-foreground">
                    Tracking
                  </div>
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
              <MapboxMap
                ref={setMapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={INITIAL_VIEW}
                // stick with default street style in BOTH modes
                mapStyle="mapbox://styles/mapbox/streets-v12"
                style={{ width: "100%", height: "100%" }}
              >
                {/* markers */}
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

                {/* popup overlay (top-left of map) */}
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

              {/* controls overlay */}
              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onToggle3D={handleToggle3D}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
