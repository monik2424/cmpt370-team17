// app/map/page.tsx  (SERVER COMPONENT - no "use client")
import { auth } from '@/lib/auth';
import { redirect } from "next/navigation";
import MapPageClient from "./MapPageClient";

export default async function MapPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <MapPageClient user={user} />
  );
}
