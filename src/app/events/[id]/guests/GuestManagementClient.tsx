"use client";

import { useState } from "react";
import GuestForm from "@/components/EventComponents/GuestForm";

interface Guest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface GuestManagementClientProps {
  eventId: string;
  initialGuests: Guest[];
}

export default function GuestManagementClient({ 
  eventId, 
  initialGuests 
}: GuestManagementClientProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);

  const handleGuestAdded = (newGuest: Guest) => {
    setGuests(prev => [newGuest, ...prev]);
  };

  const handleGuestRemoved = (guestId: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== guestId));
  };

  return (
    <GuestForm
      eventId={eventId}
      guests={guests}
      onGuestAdded={handleGuestAdded}
      onGuestRemoved={handleGuestRemoved}
    />
  );
}
