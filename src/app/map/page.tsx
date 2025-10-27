import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MapPageClient from "./MapPageClient";

export default async function MapPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user?.name ?? undefined,
  };

  return <MapPageClient user={user} />;
}
