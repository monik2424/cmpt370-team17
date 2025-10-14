'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import MapboxMap, { Marker } from 'react-map-gl/mapbox';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

const WAKABAYASHI_CRES_COORDS = {
  longitude: -106.63236444963515,
  latitude: 52.184427849889104, 
};

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute left-0 right-0 top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">EventFinder</h1>
              <p className="text-sm text-muted-foreground">
                Discover events in your area
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{12312}</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{1231}</div>
                  <div className="text-xs text-muted-foreground">Attendees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{1}</div>
                  <div className="text-xs text-muted-foreground">Tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-24">
        <div className="container mx-auto h-[calc(100vh-6rem)] px-6 pb-6">
          {MAPBOX_TOKEN ? (
            <MapboxMap
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                ...WAKABAYASHI_CRES_COORDS,
                zoom: 15,
              }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              style={{ width: '100%', height: '100%' }}
            >
              <Marker
                longitude={WAKABAYASHI_CRES_COORDS.longitude}
                latitude={WAKABAYASHI_CRES_COORDS.latitude}
                anchor="bottom"
              >
                <div className="flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full bg-primary-foreground"
                  />
                  <span aria-hidden role="img" aria-label="Birthday celebration">
                    🎉
                  </span>
                  310 Wakabayashi Cres
                </div>
              </Marker>
            </MapboxMap>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-muted-foreground text-sm text-muted-foreground">
              Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment to render the map.
            </div>
          )}
        </div>
      </main>
  </div>
  );
}
