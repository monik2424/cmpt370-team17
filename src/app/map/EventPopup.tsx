// Mark Betita
// mcb540
"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Send,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EventPopupProps {
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  tags: string[];
  onClose: () => void;
  onStartTracking: () => void;
}

export default function EventPopup({
  title,
  description,
  date,
  time,
  location,
  attendees,
  tags,
  onClose,
  onStartTracking,
}: EventPopupProps) {

  const [copied, setCopied] = useState(false);

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(location).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // hide after 1.5sec
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative pointer-events-auto w-full max-w-xl rounded-xl border border-[#2a2a2a] bg-[#111111] p-5 text-white shadow-xl"
      >
        {/* top right close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-sm text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>

        {/* badges */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 pr-8">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-[11px] font-medium text-yellow-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* title */}
        <h2 className="text-xl font-semibold leading-tight">{title}</h2>

        {/* description */}
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-gray-400 break-words">
            {description}
          </p>
        )}

        {/* details grid */}
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2a2a2a]">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-[11px] tracking-wide text-gray-400">
                Date
              </div>
              <div className="text-sm font-medium text-white">{date}</div>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2a2a2a]">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-[11px] tracking-wide text-gray-400">
                Time
              </div>
              <div className="text-sm font-medium text-white">{time}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2a2a2a]">
              <MapPin className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-[11px] tracking-wide text-gray-400">
                Location
              </div>
              <div className="text-sm font-medium text-white">
                {location}
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2a2a2a]">
              <Users className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-[11px] tracking-wide text-gray-400">
                Attendees
              </div>
              <div className="text-sm font-medium text-white">
                {attendees}
              </div>
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="mt-6 flex flex-col gap-3 text-sm text-white sm:flex-row sm:items-stretch">

          {/* TRACK */}
          <button
            onClick={onStartTracking}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2 font-medium ring-1 ring-[#2a2a2a] hover:bg-[#1f1f1f]"
          >
            <Heart className="h-4 w-4 text-red-500" />
            <span>Track</span>
          </button>

          {/* COPY ADDRESS */}
          <button
            onClick={handleCopyLocation}
            className="relative flex flex-1 items-center justify-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-2 font-medium ring-1 ring-[#2a2a2a] hover:bg-[#1f1f1f]"
          >
            <Send className="h-4 w-4" />

            {/* COPIED FEEDBACK */}
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-green-400 font-medium"
                >
                  Copied!
                </motion.span>
              ) : (
                <motion.span
                  key="getdir"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  Get Directions
                </motion.span>
              )}
            </AnimatePresence>
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
