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

// Type for events from database
interface Event {
  image: string | null;
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startAt: string;
  attendeeCount: number;
  private: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  categoryTags: Array<{
    id: string;
    nameTag: string;
  }>;
  provider?: {
    businessName: string;
  } | null;
}

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
  const [category, setCategory] = useState<string>("sports");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get category from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, []);


  // Fetch events from API when category changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/events/public?category=${category}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category]);


  // Filter events by search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }


    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredEvents(filtered);
  }, [events, searchQuery]);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };



  const handleEventClick = (eventId: string) => {
    window.location.href = `/events/${eventId}`;
  };



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
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Saskatoon Events
              </h1>
              <div className="hidden md:flex space-x-4">
                <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/events" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Events
                </a>
                <a href="/map" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Map
                </a>
                <a href="/search" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Search
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

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

          {/* Headers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-block px-4 py-2 bg-gray-800 border border-gray-700 mb-4 rounded-full">
              <span className="text-xs font-mono text-white uppercase">
                {categoryNames[category] || "Events"}
              </span>
            </div>
            <h1 className="text-4xl font-mono text-white mb-4">
              <span style={{ color: 'cyan', fontWeight: "bold"}}>{categoryNames[category]}</span> Events in Saskatoon
            </h1>
            <p className="text-sm font-mono text-gray-400 max-w-2xl">
              Discover upcoming {categoryNames[category]?.toLowerCase()} events happening around the city
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white font-mono text-sm px-10 py-3 rounded-lg focus:outline-none focus:border-gray-600 transition"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-white font-mono text-sm hover:bg-gray-700 transition cursor-pointer rounded-lg">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </motion.div>

          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs font-mono text-gray-500 mb-6"
          >
            {loading ? "Loading..." : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`}
          </motion.p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="relative px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-white font-mono">Loading events...</p>
            </div>
          ) : error ? (
            <div className="border border-red-500/20 bg-red-500/10 p-12 text-center rounded-xl">
              <h3 className="text-xl font-mono text-red-400 mb-2">Error</h3>
              <p className="text-sm font-mono text-red-300">{error}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="border border-gray-700 bg-gray-800 p-12 text-center rounded-xl"
            >
              <h3 className="text-xl font-mono text-white mb-2">No events found</h3>
              <p className="text-sm font-mono text-gray-400">
                Try adjusting your search or browse other categories
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => handleEventClick(event.id)}
                  className="border border-gray-700 bg-gray-800 overflow-hidden hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 cursor-pointer group rounded-xl shadow-lg relative flex flex-col h-[600px]"
                >
                  {/* Event Image */}
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

                    {/* Host Info */}
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-xs font-mono text-gray-400">
                        Hosted by {event.createdBy.name}
                      </p>
                    </div>

                    {/* Attend Button & Provider Profile button*/}
                    {/* TODO: implement Provider Profile recommended by TA */}
                    <div className="mt-auto pt-4 pr-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/providers");
                        }}
                        className="px-4 py-2 pr-4 bg-red-600 hover:bg-red-700 text-white text-xs font-mono rounded-lg transition"
                      >
                        Provider Profile
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation("/login");
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono rounded-lg transition"
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