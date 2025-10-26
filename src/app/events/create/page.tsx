import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import EventCreateForm from "@/components/EventComponents/EventCreateForm";

export default async function CreateEventPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) redirect("/login");
  if (user.role !== "HOST") redirect("/events"); // GUEST/PROVIDER blocked

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
