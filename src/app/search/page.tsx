"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Users, 
  Music, 
  Utensils,
  Palette,
  Sparkles,
  PartyPopper,
  Church,
  Joystick,
  BookIcon,
  Box
} from "lucide-react"; // Used React icons



// Data for the provided search categories ** MAY CHANGE BASED ON WILLIAMS EVENTS
const categories = [
  {
    id: "sports",
    title: "Sports",
    description: "Athletic events, tournaments, and recreational leagues",
    icon: Trophy,
    color: "from-orange-500/20 to-red-600/20", // Gradient instructions
  },
  {
    id: "social",
    title: "Social",
    description: "Gatherings, meetups, and social networking",
    icon: Users,
    color: "from-purple-500/20 to-pink-600/20",
  },
  {
    id: "music",
    title: "Music",
    description: "Concerts, recitals, and musical performances",
    icon: Music,
    color: "from-yellow-500/20 to-orange-600/20",
  },
  {
    id: "celebration",
    title: "Celebration",
    description: "Birthdays, anniversaries, and special occasions",
    icon: PartyPopper,
    color: "from-blue-500/20 to-indigo-600/20",
  },
  {
    id: "food",
    title: "Food & Dining",
    description: "Tastings, dinners, and culinary experiences",
    icon: Utensils,
    color: "from-green-500/20 to-teal-600/20",
  },
  {
    id: "arts",
    title: "Arts & Culture",
    description: "Exhibitions, performances, and cultural events",
    icon: Palette,
    color: "from-indigo-500/20 to-pink-600/20",
  },
  {
    id: "seasonal",
    title: "Seasonal",
    description: "Holiday parties and seasonal celebrations",
    icon: Sparkles,
    color: "from-cyan-500/20 to-blue-600/20",
  },
  {
    id: "community",
    title: "Community",
    description: "Local gatherings and community events",
    icon: Church,
    color: "from-teal-500/20 to-green-600/20",
  },
  {
    id: "tech",
    title: "Tech",
    description: "Technology focused meetups and events",
    icon: Joystick,
    color: "from-gray-500/20 to-purple-600/20",
  },
  {
    id: "education",
    title: "Education",
    description: "Academic and learning oppurtunities",
    icon: BookIcon,
    color: "from-red-500/20 to-pink-600/20",
  },
  {
    id: "other",
    title: "Other",
    description: "Unique events that form their own category",
    icon: Box,
    color: "from-blue-500/20 to-blue-600/20",
  },
];



/**
 * Categories page construction and event handling
 * Tried to align somewhat with the landing page, but 
 * will be different for sure
 */
export default function CategoriesPage() {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-900"> 
      {/* Navigation */}
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
        <div className="hidden font-mono bg-gray-800/80 md:flex gap-6 px-4 py-2 text-xs absolute left-1/2 text-white -translate-x-1/2 rounded-full">
          <a href="/" className="px-3 py-2 hover:bg-gray-700 rounded-lg transition cursor-pointer">
            Home
          </a>
          <a href="/events" className="px-3 py-2 hover:bg-gray-700 rounded-lg transition cursor-pointer">
            Events
          </a>
          <a href="/venues" className="px-3 py-2 hover:bg-gray-700 rounded-lg transition cursor-pointer">
            Venues
          </a>
          <a href="/providers" className="px-3 py-2 hover:bg-gray-700 rounded-lg transition cursor-pointer">
            Providers ↗
          </a>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            onClick={() => handleNavigation("/login")}
            className="px-4 py-2 hover:bg-gray-700 bg-gray-800 text-xs text-white font-mono transition cursor-pointer rounded-lg"
          >
            Login
          </button>
          <button
            onClick={() => handleNavigation("/register")}
            className="px-4 py-2 hover:bg-blue-700 bg-blue-600 text-xs text-white font-mono transition cursor-pointer rounded-lg"
          >
            Register
          </button>
        </div>
      </nav>



      {/* Header Section w/ Primary page title/description */}
      <section className="relative px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <div className="inline-block px-4 py-2 bg-gray-800 border border-gray-700 mb-6 rounded-full">
              <span className="text-xs font-mono text-white">
                EVENT CATEGORIES
              </span>
            </div>
            <h1 className="text-5xl font-mono text-white mb-6">
              Find Events by <span style={{ color: "cyan", fontWeight: "bold"}}> Category</span>
            </h1>
            <p className="text-sm font-mono text-gray-400 max-w-2xl mx-auto">
              Find the event you've been looking for! From sports tournaments to conventions, 
              find the perfect event for any occasion based on type.
            </p>
          </motion.div>
        </div>
      </section>




      {/* Categories Grid */}
      <section className="relative px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => handleNavigation(`/search/events?category=${category.id}`)}
                  className="relative border border-gray-700 bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
                >
                  {/* Gradient overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${category.color} 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl
                  `} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className="w-12 h-12 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-700 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Category Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-mono text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-xs font-mono text-gray-400 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>




      {/* Bottom CTA Section with page help to be implemeted*/}
      <section className="relative px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border border-gray-700 bg-gray-800 p-12 text-center rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-mono text-white mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-sm font-mono text-gray-400 mb-6 max-w-xl mx-auto">
              Browse all events or create your own custom event in Saskatoon
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleNavigation("/events")}
                className="px-6 py-3 bg-gray-700 border border-gray-600 text-sm font-mono text-white hover:bg-gray-600 transition cursor-pointer rounded-lg"
              >
                Browse All Events
              </button>
              <button
                onClick={() => handleNavigation("/create-event")}
                className="px-6 py-3 bg-white text-gray-900 text-sm font-mono hover:bg-gray-100 transition cursor-pointer rounded-lg shadow-md"
              >
                Create Event
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}