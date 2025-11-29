/**
 * Event Card Component
 * Author: Nicholas Kennedy - csy791
 * 
 * This code is refactored from my initial eventListing page.
 * Abstracted this component for better readability.
 * These cards diaplay the Events information and contain a Join + Provider profile button
 */

"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import JoinButton from "@/components/EventComponents/JoinButton";

interface EventCardProps {
  event: {
    image: string | null;
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    startAt: string;
    attendeeCount: number;
    createdBy: {
      name: string;
      email: string;
    };
  };
  index: number;
  onEventClick: (eventId: string) => void;
  onProviderClick: () => void;
}


export default function EventCard({ 
  event, 
  index, 
  onEventClick, 
  onProviderClick 
}: EventCardProps) {
  


  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };



  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };



  return (
    <motion.div
      initial={{ opacity: 1, y: 30 }}
      className="border border-gray-700 bg-gray-800 overflow-hidden hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 group rounded-xl shadow-lg relative flex flex-col h-[600px]"
    >


      {/* Event Image - AUTHOR ~ William */}
        <div className="h-48 border-b border-gray-700 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            {event.image ? (
            <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
            />
            ) : (
                <Calendar className="w-12 h-12 text-gray-600" />
            )}
      </div>



      {/* Event Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-mono text-white mb-3 group-hover:text-white/90 transition">
          {event.name}
        </h3>
        
        <p className="text-xs font-mono text-gray-400 mb-4 line-clamp-2">
          {event.description || "No description available"}
        </p>


        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>{event.location || "Location TBA"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <Users className="w-4 h-4" />
            <span>{event.attendeeCount} attending</span>
          </div>
        </div>

        {/* Host */}
        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs font-mono text-gray-400">
            Hosted by {event.createdBy.name}
          </p>
        </div>


        {/* Join + Provider Buttons */}
        <div className="mt-auto pt-4 pr-2 flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProviderClick();
            }}
            className="px-4 py-2 bg-red-400 hover:bg-red-600 text-white text-xs font-mono rounded-lg transition"
          >
            Provider Profile
          </button>
          <JoinButton id={event.id} />
        </div>
      </div>
    </motion.div>
  );
}