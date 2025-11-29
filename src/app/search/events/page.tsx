/**
 * Search EventsListing Page
 * Author: Nicholas Kennedy - csy791
 * 
 * Routes from the 'Category Cards' on the Search page.
 * Each Category card displays the necessary details filled 
 * out in the Event Create form.
 * 
 */
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLimit from "@/components/SearchComponents/pageLimit";
import EventCard from "@/components/SearchComponents/eventCard";

import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";


// Uses same variables as Events created
interface Event {
  id: string;
  name: string;
  image: string | null;
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

const eventsPerPage = 15; 


export default function EventsListingPage() {

  // useState setters and variables
  const [category, setCategory] = useState<string>("sports");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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

    // Allows typed search to parse name, location and description within the specific category. Ref. https://react.dev/learn/rendering-lists
    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredEvents(filtered);
  }, [events, searchQuery]);


  // Page Limit Changes
  const pageTotal = Math.ceil(filteredEvents.length / eventsPerPage);
  const pageStartIndex = (currentPage - 1) * eventsPerPage;
  const pageEndIndex = pageStartIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(pageStartIndex, pageEndIndex);

  

  // Pull the viewport to top of page when a new page number is selected
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };


  const handleEventClick = (eventId: string) => {
    window.location.href = `/events/${eventId}`;
  };


  return (
    <div className="min-h-screen bg-gray-900">


      {/* Navigation  ~ TODO: Maybe turn this into a component*/}
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
            initial={{ opacity: 1, y: 20 }}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onEventClick={handleEventClick}
                    onProviderClick={() => handleNavigation("/providers")}
                  />
                ))}
              </div>

              {/* Pages Component call */}
              <PageLimit
                currentPage={currentPage}
                totalPages={pageTotal}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}