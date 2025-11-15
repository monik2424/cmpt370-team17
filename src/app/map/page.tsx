import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MapPageClient, { EventForMap, MapUser } from "./MapPageClient";
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

// --- Tag → Icon type mapping ------------------------------------------

function inferMarkerTypeFromTags(tags: string[]): EventForMap["type"] {
  const normalized = tags.map((t) => t.toLowerCase());

  const has = (substrings: string[]) =>
    normalized.some((t) =>
      substrings.some((s) => t.includes(s))
    );

  // birthday: Cake
  if (has(["birthday"])) return "birthday";

  // concert, recital, musical performance: Music
  if (has(["concert", "recital", "musical", "performance"])) return "concert";

  // conference: Briefcase
  if (has(["conference"])) return "conference";

  // gym, work out, exercise: Dumbbell (sports)
  if (has(["gym", "work out", "workout", "exercise", "fitness"])) {
    return "sports";
  }

  // art: GraduationCap
  if (has(["art", "arts"])) return "art";

  // networking: Users
  if (has(["networking", "mixer", "meetup", "meet-up"])) return "networking";

  // entertainment: Film
  if (has(["entertainment", "movie", "film", "theatre", "theater", "show"])) {
    return "entertainment";
  }

  // social: Coffee
  if (has(["social", "hangout", "hang-out", "coffee", "casual"])) {
    return "social";
  }

  // tournament: Trophy
  if (has(["tournament", "competition", "league", "championship"])) {
    return "tournament";
  }

  // celebration, anniversaries, special occasion: PartyPopper
  if (
    has([
      "celebration",
      "celebrate",
      "anniversary",
      "anniversaries",
      "special occasion",
      "party",
    ])
  ) {
    return "celebration";
  }

  // food, tasting, dinner, culinary: Utensils
  if (
    has([
      "food",
      "tasting",
      "dinner",
      "culinary",
      "brunch",
      "lunch",
      "supper",
      "buffet",
    ])
  ) {
    return "food";
  }

  // artshow, exhibition, performance, cultural events: Palette
  if (
    has([
      "artshow",
      "art show",
      "exhibition",
      "gallery",
      "cultural",
      "culture",
      "performance",
    ])
  ) {
    return "artshow";
  }

  // seasonal, holiday: Sparkles
  if (
    has([
      "seasonal",
      "holiday",
      "christmas",
      "easter",
      "halloween",
      "new year",
    ])
  ) {
    return "seasonal";
  }

  // community, local gatherings, church event: Church
  if (
    has([
      "community",
      "local",
      "neighborhood",
      "neighbourhood",
      "church",
      "parish",
      "ministry",
    ])
  ) {
    return "community";
  }

  // technology: Joystick
  if (
    has([
      "technology",
      "tech",
      "startup",
      "developer",
      "dev",
      "coding",
      "programming",
      "hackathon",
    ])
  ) {
    return "tech";
  }

  // education, academic, learning: BookIcon
  if (
    has([
      "education",
      "academic",
      "lecture",
      "class",
      "course",
      "workshop",
      "learning",
      "seminar",
    ])
  ) {
    return "education";
  }

  // other (events that don't fit other categories): Box
  return "other";
}

export default async function MapPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user: MapUser = {
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

    // string address, geocode it
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

    const tagNames = e.categoryTags.map((t) => t.nameTag);
    const markerType = inferMarkerTypeFromTags(tagNames);

    const isTracking = false;

    events.push({
      id: e.id,
      title: e.name,
      type: markerType,
      date: dateStr,
      time: timeStr,
      location: e.location ?? "Saskatoon",
      attendees: e.attendeeCount,
      lat,
      lng,
      description: e.description ?? undefined,
      isTracking,
      tags: tagNames,
    });
  }

  return <MapPageClient user={user} events={events} />;
}
