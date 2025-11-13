import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MapPageClient, { EventForMap } from "./MapPageClient";
import db from "@/modules/db";

const MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

// Mapbox geocoding helper
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;

  const encoded = encodeURIComponent(address);
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}`
  );

  if (!res.ok) {
    console.warn("Geocoding failed:", res.status, res.statusText);
    return null;
  }

  const data = await res.json();
  const first = data.features?.[0];
  if (!first || !first.center) return null;

  const [lng, lat] = first.center as [number, number];
  return { lat, lng };
}

export default async function MapPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // fix the 'name: string | null' type issue
  const user = {
    name: session.user?.name ?? undefined,
  };

  // pull events from DB; filter to future/public/etc 
  const dbEvents = await db.event.findMany({
    include: {
      map: true,
      categoryTags: true,
    },
    orderBy: {
      startAt: "asc",
    },
  });

  const events: EventForMap[] = [];

  for (const e of dbEvents) {
    let lat = e.map?.latitude ?? null;
    let lng = e.map?.longitude ?? null;

    //string address, geocode it
    if ((lat == null || lng == null) && e.location) {
      const coords = await geocodeAddress(e.location);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        
      }
    }

    if (lat == null || lng == null) {
      continue;
    }

    const dateObj = e.startAt;
    const dateStr = dateObj.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = dateObj.toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
    });

    const rawType = e.categoryTags[0]?.nameTag ?? "social";
    const type = rawType.toLowerCase();

    const isTracking = false;

    events.push({
      id: e.id,
      title: e.name,
      type,
      date: dateStr,
      time: timeStr,
      location: e.location ?? "Saskatoon",
      attendees: e.attendeeCount,
      lat,
      lng,
      description: e.description ?? undefined,
      isTracking,
    });
  }

  return <MapPageClient user={user} events={events} />;
}
