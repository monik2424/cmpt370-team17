/**
 * Search Categories Page
 * Author: Nicholas Kennedy - csy791
 * 
 * Routes from the 'Search' button on the User Dashboard.
 * The page initializes and lists the event Categories from the stored object array.
 * Also includes another way of accessing event creation at bottom of page.
 * 
 * References:
 * https://tailwindcss.com/docs/colors
 * https://motion.dev/docs/react-motion-component
 */

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
} from "lucide-react";
import LeaveButton from "@/components/EventComponents/LeaveButton";

const categories = [
  {
    id: "sports",
    title: "Sports",
    description: "Athletic events, tournaments, and recreational leagues",
    icon: Trophy,
    color: "from-orange-500/20 to-red-600/20", // Gradient color fade
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
 * Categories page construction and event handling.
 * Integrates the User dashboard from /src/app/dashboard ~ author: William [Lines 124-149]
 */
export default function CategoriesPage() {

  
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gray-900"> 
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">

              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                SaskPlan
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



      {/* Headers */}
      <section className="relative px-8 py-20">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }} // Animations made through referencing: https://motion.dev/docs/react-motion-component
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
              Find Events by <span style={{ color: "rgb(245, 197, 66)", fontWeight: "bold"}}> Category</span>
            </h1>
            <p className="text-sm font-mono text-gray-400 max-w-2xl mx-auto">
              Find the event you've been looking for.
              From sports tournaments & meetups, to conventions & dining, 
              there are always new oppurtunities around the corner!
            </p>
          </motion.div>

        </div>
      </section>




      {/* Categories Grid */}
      <section className="relative px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => { // Loops through each category and creates a new display card object
              
              const IconComponent = category.icon;
              
              return (

                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }} 
                  onClick={() => handleNavigation(`/search/events?category=${category.id}`)}
                  className="relative border border-gray-700 bg-gray-800 p-6 rounded-xl hover:border-gray-600 transition-all duration-300 hover:bg-gray-750 shadow-lg cursor-pointer group"
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




      {/* Bottom Option to Create New Wvents*/}
      <section className="relative px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            className="border border-gray-700 bg-gray-800 p-12 text-center rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-mono text-white-400 font-weight-bold">
              Can't find what you're looking for?
            </h2>
            <p className="text-sm font-mono text-gray-400 mb-6 max-w-xl mx-auto">
              Create the event you've always wanted to attend!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleNavigation("/events/create")}
                className="px-18 py-3 bg-cyan-500 text-black-400 text-lg font-mono rounded-lg hover:bg-blue-800 transition-colors duration-300"
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