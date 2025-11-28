// Mark Betita
// mcb540
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxMap, { Marker, MapRef, Source, Layer } from "react-map-gl/mapbox";
import EventCluster from "./EventCluster";
import EventPopup from "./EventPopup";
import TrackingPopup from "./TrackingPopup";
import {
  Box,
  MapPin,
  Dumbbell,
  Coffee,
  Music,
  PartyPopper,
  Utensils,
  Palette,
  Sparkles,
  Church,
  Joystick,
  BookIcon,
} from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

const INITIAL_VIEW = {
  longitude: -106.67,
  latitude: 52.13,
  zoom: 13,
  bearing: 0,
  pitch: 0,
};

// ---- Shared types ---------------------------------------------------

export type EventForMap = {
  id: string;
  title: string;
  type:
    | "birthday"
    | "concert"
    | "conference"
    | "sports"
    | "art"
    | "networking"
    | "entertainment"
    | "social"
    | "tournament"
    | "celebration"
    | "food"
    | "artshow"
    | "seasonal"
    | "community"
    | "tech"
    | "education"
    | "other";
  date: string;
  time: string;
  location: string;
  attendees: number;
  lat: number;
  lng: number;
  description?: string;
  isTracking: boolean;
  tags: string[];
};

export type MapUser = {
  name?: string | null;
};

type Props = {
  user: MapUser;
  events: EventForMap[];
};

// For Tracking Route Line

type RouteFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: Record<string, unknown>;
};

type RouteFeatureCollection = {
  type: "FeatureCollection";
  features: RouteFeature[];
};

// zoom / 3D toggle buttons
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

type EventType = EventForMap["type"];

type FilterConfig = {
  id: string;
  label: string;
  types: EventType[];
  Icon: React.ComponentType<{ className?: string }>;
};

const FILTERS: FilterConfig[] = [
  // sports
  {
    id: "sports",
    label: "Sports",
    types: ["sports"],
    Icon: Dumbbell,
  },
  // social
  {
    id: "social",
    label: "Social",
    types: ["social"],
    Icon: Coffee,
  },
  // music (concerts)
  {
    id: "music",
    label: "Music",
    types: ["concert"],
    Icon: Music,
  },
  // celebration (includes birthdays)
  {
    id: "celebration",
    label: "Celebration",
    types: ["celebration", "birthday"],
    Icon: PartyPopper,
  },
  // food & dining
  {
    id: "food",
    label: "Food & Dining",
    types: ["food"],
    Icon: Utensils,
  },
  // arts & culture (art + artshow)
  {
    id: "arts",
    label: "Arts & Culture",
    types: ["art", "artshow"],
    Icon: Palette,
  },
  // seasonal
  {
    id: "seasonal",
    label: "Seasonal",
    types: ["seasonal"],
    Icon: Sparkles,
  },
  // community
  {
    id: "community",
    label: "Community",
    types: ["community"],
    Icon: Church,
  },
  // tech
  {
    id: "tech",
    label: "Tech",
    types: ["tech"],
    Icon: Joystick,
  },
  // education
  {
    id: "education",
    label: "Education",
    types: ["education"],
    Icon: BookIcon,
  },
  // other – also catches misc types
  {
    id: "other",
    label: "Other",
    types: ["other", "conference", "networking", "entertainment", "tournament"],
    Icon: Box,
  },
];

export default function MapPageClient({ user, events }: Props) {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [isTrackingRoute, setIsTrackingRoute] = useState(false);
  const [travelInfo, setTravelInfo] = useState<{
    driving?: { distance: number; duration: number };
    walking?: { distance: number; duration: number };
    cycling?: { distance: number; duration: number };
  } | null>(null);

  const [routeGeoJSON, setRouteGeoJSON] =
    useState<RouteFeatureCollection | null>(null);

  const [is3D, setIs3D] = useState(false);

  // filter state
  const [activeTypes, setActiveTypes] = useState<EventForMap["type"][]>([]);

  // which event is currently being tracked (for banner + popup title)
  const [trackingEventTitle, setTrackingEventTitle] = useState<string | null>(
    null
  );

  const handleToggleFilter = (types: EventType[] | "all") => {
    if (types === "all") {
      setActiveTypes([]);
      return;
    }

    setActiveTypes((prev) => {
      const allIncluded = types.every((t) => prev.includes(t));

      if (allIncluded) {
        // turn OFF: remove all these types
        return prev.filter((t) => !types.includes(t));
      }

      // turn ON: add any missing types
      const next = [...prev];
      for (const t of types) {
        if (!next.includes(t)) next.push(t);
      }
      return next;
    });
  };

  const isAllActive = activeTypes.length === 0;

  const isFilterActive = (types: EventType[]) =>
    types.some((t) => activeTypes.includes(t));

  const filteredEvents = useMemo(
    () =>
      activeTypes.length === 0
        ? events
        : events.filter((e) => activeTypes.includes(e.type)),
    [events, activeTypes]
  );

  const mapRef = useRef<MapRef | null>(null);
  const setMapRef = useCallback((instance: MapRef | null) => {
    mapRef.current = instance;
  }, []);

  const activeEvent = useMemo(
    () => events.find((e) => e.id === activeMarkerId) ?? null,
    [activeMarkerId, events]
  );

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 200 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 200 });
  }, []);

  // event cluster
  const clusters = useMemo(() => {
    const map = new Map<
      string,
      { lat: number; lng: number; events: EventForMap[] }
    >();

    for (const e of filteredEvents) {
      // round to avoid tiny floating-point differences
      const key = `${e.lat.toFixed(5)}:${e.lng.toFixed(5)}`;
      const existing = map.get(key);
      if (existing) {
        existing.events.push(e);
      } else {
        map.set(key, { lat: e.lat, lng: e.lng, events: [e] });
      }
    }

    return Array.from(map.values());
  }, [filteredEvents]);

  // Mapbox 3D buildings layer
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
        layer.type === "symbol" && layer.layout && layer.layout["text-field"]
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

  // geolocation (get user position once)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setUserLocation({
          lat: latitude,
          lng: longitude,
        });

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
  }, []);

  // fetch Mapbox Directions for driving/walking/biking
  const fetchDirectionsAndTravelInfo = useCallback(
    async (
      origin: { lat: number; lng: number },
      destination: { lat: number; lng: number }
    ): Promise<{
      metrics: {
        [mode: string]: { distance: number; duration: number };
      };
      drivingRoute: RouteFeatureCollection | null;
    }> => {
      const profiles = [
        { profile: "mapbox/driving", key: "driving" },
        { profile: "mapbox/walking", key: "walking" },
        { profile: "mapbox/cycling", key: "cycling" },
      ];

      const metricsResult: {
        [mode: string]: { distance: number; duration: number };
      } = {};

      let drivingGeoJSON: RouteFeatureCollection | null = null;

      await Promise.all(
        profiles.map(async ({ profile, key }) => {
          const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
          const url = `https://api.mapbox.com/directions/v5/${profile}/${coords}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`;

          const res = await fetch(url);
          const data = await res.json();

          if (data.routes && data.routes.length > 0) {
            const route0 = data.routes[0];

            metricsResult[key] = {
              distance: route0.distance,
              duration: route0.duration,
            };

            if (key === "driving" && route0.geometry) {
              const lineCoords = route0.geometry.coordinates as [
                number,
                number
              ][];

              drivingGeoJSON = {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: {
                      type: "LineString",
                      coordinates: lineCoords,
                    },
                    properties: {},
                  },
                ],
              };
            }
          }
        })
      );

      return {
        metrics: metricsResult,
        drivingRoute: drivingGeoJSON,
      };
    },
    []
  );

  // Only toggles popup; does NOT affect tracking
  const handleMarkerClick = (id: string) => {
    setActiveMarkerId((prev) => (prev === id ? null : id));
  };

  const handleStartTracking = useCallback(async () => {
    if (!userLocation || !activeEvent) return;

    const { metrics, drivingRoute } = await fetchDirectionsAndTravelInfo(
      userLocation,
      { lat: activeEvent.lat, lng: activeEvent.lng }
    );

    setTravelInfo(metrics);
    setRouteGeoJSON(drivingRoute);
    setIsTrackingRoute(true);
    setTrackingEventTitle(activeEvent.title);

    if (
      mapRef.current &&
      drivingRoute &&
      drivingRoute.features.length > 0 &&
      drivingRoute.features[0].geometry.coordinates.length > 0
    ) {
      const coords = drivingRoute.features[0].geometry.coordinates;

      let minLng = coords[0][0];
      let maxLng = coords[0][0];
      let minLat = coords[0][1];
      let maxLat = coords[0][1];

      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 800 }
      );
    }
  }, [userLocation, activeEvent, fetchDirectionsAndTravelInfo]);

  const handleStopTracking = useCallback(() => {
    setIsTrackingRoute(false);
    setRouteGeoJSON(null);
    setTravelInfo(null);
    setTrackingEventTitle(null);
  }, []);

  const PAGE_SHELL_CLASSES = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* NAVBAR */}
      <nav className="bg-[#1f2937] text-white shadow dark:bg-gray-800">
        <div className={PAGE_SHELL_CLASSES}>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-white">
                Saskatoon Events
              </h1>

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

              <a
                href="/search"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Search
              </a>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-300">{user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

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
              <div className="text-center">
                <div className="text-2xl font-bold text-primary text-white dark:text-white">
                  {events.length}
                </div>
                <div className="text-xs text-muted-foreground text-gray-400">
                  Events
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAP SECTION */}
      <main className="flex flex-1 bg-gray-900/10 py-4 dark:bg-gray-900">
        <div className={PAGE_SHELL_CLASSES + " flex w-full flex-col gap-3"}>
          {/* EVENT TYPE FILTER BAR */}
          <section>
            <div className="mb-1 text-xs font-semibold tracking-wide text-gray-400">
              EVENT TYPES
            </div>
            <div className="flex flex-wrap gap-2">
              {/* All Events first */}
              <button
                onClick={() => handleToggleFilter("all")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isAllActive
                    ? "border-yellow-500 bg-yellow-500 text-black shadow-sm"
                    : "border-gray-600 bg-transparent text-gray-200 hover:border-gray-400"
                }`}
              >
                <MapPin className="h-3 w-3" /> <span>All Events</span>
              </button>
              {FILTERS.map(({ id, label, types, Icon }) => {
                const active = isFilterActive(types);
                return (
                  <button
                    key={id}
                    onClick={() => handleToggleFilter(types)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-200 shadow-sm"
                        : "border-gray-600 bg-transparent text-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Icon className="h-3 w-3" /> <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* CURRENTLY TRACKING BANNER */}
          {isTrackingRoute && trackingEventTitle && (
            <div className="flex items-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs text-blue-100">
              <MapPin className="h-3 w-3 text-blue-300" />
              <span className="uppercase tracking-wide text-[10px] text-blue-300">
                Currently tracking
              </span>
              <span className="truncate text-xs font-semibold">
                {trackingEventTitle}
              </span>
            </div>
          )}

          {/* MAP CARD */}
          <div className="relative h-[640px] overflow-hidden rounded-md border border-border bg-black/5 shadow-sm dark:bg-black/20">
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
                  {/* route line overlay */}
                  {isTrackingRoute && routeGeoJSON && (
                    <Source id="route" type="geojson" data={routeGeoJSON}>
                      <Layer
                        id="route-line"
                        type="line"
                        layout={{ "line-join": "round", "line-cap": "round" }}
                        paint={{
                          "line-color": "#00bfff",
                          "line-width": 4,
                          "line-opacity": 0.9,
                        }}
                      />
                    </Source>
                  )}

                  {/* clusters */}
                  {clusters.map((cluster, idx) => {
                    const hasActive = cluster.events.some(
                      (e) => e.id === activeMarkerId
                    );

                    return (
                      <Marker
                        key={`${cluster.lat}-${cluster.lng}-${idx}`}
                        longitude={cluster.lng}
                        latitude={cluster.lat}
                        anchor="bottom"
                      >
                        <EventCluster
                          events={cluster.events}
                          isActive={hasActive}
                          onEventClick={(event) => handleMarkerClick(event.id)}
                        />
                      </Marker>
                    );
                  })}

                  {/* user location */}
                  {userLocation && (
                    <Marker
                      longitude={userLocation.lng}
                      latitude={userLocation.lat}
                      anchor="center"
                    >
                      <div className="relative">
                        <span className="absolute inline-block h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-blue-500/30 blur-[2px]" />
                        <span className="relative inline-block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-md dark:border-gray-900" />
                      </div>
                    </Marker>
                  )}

                  {/* event popup (closing DOES NOT stop tracking anymore) */}
                  {activeEvent && (
                    <div className="pointer-events-none absolute top-4 left-0 z-30">
                      <div
                        className={
                          PAGE_SHELL_CLASSES + " pointer-events-auto max-w-xl"
                        }
                      >
                        <EventPopup
                          title={activeEvent.title}
                          description={activeEvent.description}
                          date={activeEvent.date}
                          time={activeEvent.time}
                          location={activeEvent.location}
                          attendees={activeEvent.attendees}
                          tags={activeEvent.tags ?? []}
                          onClose={() => {
                            setActiveMarkerId(null); // just hide details
                          }}
                          onStartTracking={handleStartTracking}
                        />
                      </div>
                    </div>
                  )}
                </MapboxMap>

                {/* map UI controls */}
                <MapControls
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onToggle3D={handleToggle3D}
                />
              </div>
            )}

            {/* bottom tracking popup – persists until Stop Tracking */}
            {isTrackingRoute && travelInfo && trackingEventTitle && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 flex justify-center pb-4">
                <div className="pointer-events-auto w-full max-w-xl px-4">
                  <TrackingPopup
                    eventTitle={trackingEventTitle}
                    travelInfo={travelInfo}
                    onStopTracking={handleStopTracking}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
