/* EventListing page 
   Main Author: Nicholas Kennedy
   Lines 158-203 was kept similar in formatting to landing page by Kartik  */

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";

import { auth, signOut } from '@/lib/auth';

// Stub event data - TODO: replace with connection to william's event data
const stubEvents = [
  {
    id: 1,
    title: "Saskatchewan Masters Regional Swim Meet",
    category: "sports",
    date: "2025-11-15",
    time: "8:00 AM",
    venue: "Shaw Center",
    location: "Bowlit Crescent",
    attendees: 500,
    maxAttendees: 800,
    image: "/placeholder-sports1.jpg", // TODO: add placeholder images
    description: "Annual Masters swimming event featuring teams from across Saskatchewan",
    host: "Saskatoon Goldfins Swim Club"
  },
  {
    id: 2,
    title: "Community Soccer League Finals",
    category: "sports",
    date: "2025-11-20",
    time: "2:00 PM",
    venue: "Gordie Howe Sports Complex",
    location: "1640 Nelson Rd, Saskatoon",
    attendees: 120,
    maxAttendees: 150,
    image: "/placeholder-sports2.jpg",
    description: "Championship match of the fall soccer season",
    host: "Saskatoon Recreation"
  },
  {
    id: 3,
    title: "Networking Mixer: Tech & Innovation",
    category: "social",
    date: "2025-11-12",
    time: "6:00 PM",
    venue: "Remai Modern",
    location: "102 Spadina Crescent E, Saskatoon",
    attendees: 78,
    maxAttendees: 100,
    image: "/placeholder-social.jpg",
    description: "Connect with local tech professionals and entrepreneurs",
    host: "Saskatoon Tech Hub"
  },
  {
    id: 4,
    title: "Vivaldi: Four Seasons Concerto",
    category: "music",
    date: "2025-12-12",
    time: "6:00 PM",
    venue: "TCU Place",
    location: "dsfsdfhksdjfklsj",
    attendees: 78,
    maxAttendees: 150,
    image: "/placeholder-music.jpg",
    description: "Enjoy Saskatoon philharmonic's rendition of the Baroque classic",
    host: "Saskatoon philharmonic"
  },
  {
    id: 5,
    title: "Rouguelike Game Jam",
    category: "tech",
    date: "2026-01-15",
    time: "6:00 PM",
    venue: "Thorvaldson Usask",
    location: "dsfsdfhksdjfklsj",
    attendees: 37,
    maxAttendees: 100,
    image: "/placeholder-tech.jpg",
    description: "Work together to build creative and inspired Rouguelike games",
    host: "Usask game dev"
  },
];



/**
 * Map tag as a key to a representative display string
 */
const categoryNames: { [key: string]: string } = {
  sports: "Sports",
  social: "Social",
  music: "Music",
  celebration: "Celebration",
  food: "Food & Dining",
  arts: "Arts & Culture",
  seasonal: "Seasonal",
  community: "Community",
  tech: "Tech",
  education: "Education",
  other: "Other"
};




export default function EventsListingPage() {
  const [category, setCategory] = useState<string>("sports"); // Initialize useState setters ~ Referenced https://react.dev/reference/react/useState
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(stubEvents);

  // Use the URLSearchParams from node to Get the category from the URL parameters [ie. ?category=sports]
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, []);


  
  // Filter events by category so that only they appear upon click
  useEffect(() => {
    let filtered = stubEvents.filter(event => event.category === category);
    
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredEvents(filtered);
  }, [category, searchQuery]);



  const handleNavigation = (path: string) => {
    window.location.href = path;
  };



  const handleEventClick = (eventId: number) => {
    window.location.href = `/events/${eventId}`; // TODO: Link events with william
  };


  {/**************************** Adapted from Landing Page ************************************/}
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation toolbar - adapted from existing landing page*/}
      <nav className="relative z-10 flex items-center py-6 px-8 w-full mx-auto bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/logo.png"
            alt="CMPT370 Logo"
            width="32"
            height="32"
            className="w-8 h-8"
          />
          <span className="ml-1 text-sm text-white font-mono">Saskatoon Events</span>
        </div>
        <div className="hidden font-mono bg-white/5 md:flex gap-6 px-4 py-2 text-xs absolute left-1/2 text-white -translate-x-1/2">
          <a href="/" className="px-3 py-2 hover:bg-white/10 transition cursor-pointer">
            Home
          </a>
          <a href="/events" className="px-3 py-2 hover:bg-white/10 transition cursor-pointer">
            Events
          </a>
          <a href="/search" className="px-3 py-2 hover:bg-white/10 transition cursor-pointer">
            Categories
          </a>
          <a href="/providers" className="px-3 py-2 hover:bg-white/10 transition cursor-pointer">
            Providers ↗
          </a>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <button
              onClick={() => signOut({ redirectTo: '/' })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono rounded-lg transition cursor-pointer"
              >
              Logout
            </button>
          </div>
      </nav>
      {/**************************** END of Adapted content from Landing Page ************************************/}
      

      {/* Header Section */}
      <section className="relative px-8 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => handleNavigation("/search")}
            className="flex items-center gap-2 text-white/70 hover:text-white font-mono text-sm mb-8 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </motion.button>

          {/* Headers and sub-heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 mb-4">
              <span className="text-xs font-mono text-white uppercase">
                {categoryNames[category] || "Events"}
              </span>
            </div>
            <h1 className="text-4xl font-mono text-white mb-4">
              <span style={{ color: 'cyan', fontWeight: "bold"}}>{categoryNames[category]}</span> Events in Saskatoon
            </h1>
            <p className="text-sm font-mono text-white/70 max-w-2xl">
              Discover upcoming {categoryNames[category]?.toLowerCase()} events happening around the city
            </p>
          </motion.div>

          {/* Search and Filter Bar - Currently filter is a dead button  */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // update search query on a letter by letter basis * uses React useState
                className="w-full bg-white/5 border border-white/10 text-white font-mono text-sm px-10 py-3 focus:outline-none focus:border-white/30 transition"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm hover:bg-white/10 transition cursor-pointer">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </motion.div>

          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs font-mono text-white/50 mb-6"
          >
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </motion.p>
        </div>
      </section>



      {/* Events Grid */}
      <section className="relative px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredEvents.length === 0 ? ( // if there are no events meeting search
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border border-white/10 bg-white/5 p-12 text-center"
            >
              <h3 className="text-xl font-mono text-white mb-2">No events found</h3>
              <p className="text-sm font-mono text-white/60">
                Try adjusting your search or browse other categories
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
              {filteredEvents.map((event, index) => ( // Set my layout
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => handleEventClick(event.id)}
                  className="border border-white/10 bg-black/40 overflow-hidden hover:bg-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                >

                  {/* Event Image Placeholder */}
                  <div className="h-48 bg-white/5 border-b border-white/10 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-white/20" />
                  </div>


                  {/* Event Content */}
                  <div className="p-6 flex flex-col">
                    <h3 className="text-lg font-mono text-white mb-3 group-hover:text-white/90 transition">
                      {event.title}
                    </h3>
                    
                    <p className="text-xs font-mono text-white/60 mb-4 line-clamp-2">
                      {event.description}
                    </p>



                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} / {event.maxAttendees} attending</span>
                      </div>
                    </div>



                    {/* Host Info */}
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs font-mono text-white/50">
                        Hosted by {event.host}
                      </p>
                    </div>


                    {/* Attend Event Button */}
                    <div className="flex justify-end">
                        <button
                          onClick={() => handleNavigation("/login")} // PLACEHOLDER ~ Will replace with event connection
                          className="px-4 py-2 bg-blue-600 border border-black-600 text-sm font-mono text-white hover:bg-blue-300 hover:text-black transition cursor-pointer rounded-lg"
                        >
                          Attend
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}