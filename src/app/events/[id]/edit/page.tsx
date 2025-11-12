import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/modules/db";
import EditEventForm from "../../../../components/EventComponents/EditEventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const event = await db.event.findUnique({
    where: { id: params.id },
    include: { attendees: true, categoryTags: true },
  });

  if (!event) redirect("/events");
  if (event.createdById !== session.user.id) redirect("/events");

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Edit Event
      </h1>
      <EditEventForm event={event} />
    </div>
  );
}
