/**
 * CreateEventPage
 * ----------------------------------------------------------------------------
 *   Renders a Host-only event creation screen. The actual form logic lives in
 *   EventCreateForm (a client component) so the user can interactively type,
 *   validate, and submit fields from the browser.
 *
 *   - If no session exists -> redirect to /login
 *   - If the user is NOT a Host -> redirect to /events
 *     (Prevents Guests/Providers from creating events by typing the URL manually)
 *
 *   EventCreateForm.tsx (client form UI)
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import EventCreateForm from "@/components/EventComponents/EventCreateForm";

export default async function CreateEventPage() {
  // Retrieve the current authenticated session
  const session = await auth();
  const user = session?.user as any;

  // Role-based access: only HOST users can create events
  if (!user) redirect("/login");
  if (user.role !== "HOST") redirect("/events");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Create an Event</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <EventCreateForm />
        </div>
      </div>
    </div>
  );
}
