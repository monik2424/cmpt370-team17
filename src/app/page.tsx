"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { TextAnimate } from "@/components/magicui/text-animate";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/ui/kibo-ui/announcement";
import { ArrowUpRightIcon, Globe, Megaphone, FileText } from "lucide-react";

// Square component for animated beam
const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex size-12 items-center justify-center border border-white/20 bg-black/60 p-3 ${className}`}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function Home() {
  const router = useRouter();

  // Refs for animated beam
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Hero Section with GIF Background */}
      <div
        className="min-h-screen bg-black relative overflow-hidden"
        style={{
          backgroundImage: "url('/final.gif')",
          backgroundSize: "cover",
          backgroundPosition: "80% 50%",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "exclusion",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 z-0"></div>
        <nav className="relative z-10 flex items-center py-6 px-8 w-full mx-auto bg-black/50">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="CMPT370 Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="ml-1 text-sm text-white font-mono">Saskatoon Events</span>
          </div>
          <div className="hidden font-mono bg-white/5 md:flex gap-6 px-4 py-2 text-xs absolute left-1/2 text-white -translate-x-1/2">
            <Link href="/" className="px-3 py-2 hover:bg-white/10 transition">
              Home
            </Link>
            <Link href="/events" className="px-3 py-2 hover:bg-white/10 transition">
              Events
            </Link>
            <Link href="/venues" className="px-3 py-2 hover:bg-white/10 transition">
              Venues
            </Link>
            <Link href="/providers" className="px-3 py-2 hover:bg-white/10 transition">
              Providers ↗
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 hover:bg-white/20 bg-white/5 text-xs text-white font-mono transition cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 hover:bg-blue-700 bg-blue-600 text-xs text-white font-mono transition cursor-pointer"
            >
              Register
        </button>
          </div>
        </nav>

        <div
          style={{ height: "1px", backgroundColor: "white", opacity: 0.2 }}
          className="w-full mb-4"
        ></div>

        {/* Hero Section */}
        <section
          className="relative flex flex-col items-center justify-center min-h-[calc(100vh-100px)] flex-1 -mt-30"
          style={{
            fontFamily: "GellixMedium, sans-serif",
            minHeight: "calc(100vh - 100px)",
          }}
        >
          {/* Radial overlay for better text legibility */}
          <div
            className="absolute inset-0 z-5"
            style={{
              background:
                "radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 70%, transparent 100%)",
            }}
          ></div>

          <div className="relative z-10 w-full flex flex-col items-center">
            <Announcement className="mb-8">
              <AnnouncementTag>Now in Saskatoon</AnnouncementTag>
              <AnnouncementTitle>
                Private Event Planning Made Simple!
                <ArrowUpRightIcon
                  className="shrink-0 text-muted-foreground"
                  size={16}
                />
              </AnnouncementTitle>
            </Announcement>

            <TextAnimate
              animation="fadeIn"
              by="line"
              as="h1"
              className="text-5xl font-mono text-center text-white mb-6 max-w-2xl mx-auto"
            >
              {`Saskatoon Event Planning Platform`}
            </TextAnimate>
            <TextAnimate
              animation="fadeIn"
              by="line"
              as="p"
              className="mt-2 text-xs text-white/50 text-center max-w-xl mb-8 font-mono"
            >
              Connect hosts, venues, and service providers for seamless private event coordination.
            </TextAnimate>
            <motion.div
              className="flex justify-center mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ShimmerButton
                onClick={() => router.push("/register")}
                background="linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)"
                shimmerColor="#667eea"
                shimmerDuration="2.5s"
                borderRadius="12px"
                className="font-mono text-sm px-8 py-3 text-black hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
              >
                Plan Your Event
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </motion.div>
          </div>
        </section>

        {/* Gradient fade transition */}
        <div
          className="h-32"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,1) 100%)",
          }}
        ></div>
      </div>

      {/* Rest of content with black background */}
      <div className="bg-black -mt-32">
        {/* App Preview Section */}
        <section className="relative z-10 flex justify-center items-center pb-20 px-8 -mt-50">
          <div className="relative max-w-6xl mx-auto">
            <BorderBeam />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative"
            >
              <div className="shadow-2xl border border-white/20 p-1 bg-white/5 rounded-lg">
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-mono text-white mb-4">Event Planning Dashboard</h3>
                  <p className="text-sm font-mono text-white/70 mb-6">
                    Create, manage, and coordinate private events in Saskatoon
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                      <h4 className="text-sm font-mono text-white mb-2">Create Events</h4>
                      <p className="text-xs text-white/60">Birthdays, meetings, parties, and more</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                      <h4 className="text-sm font-mono text-white mb-2">Find Venues</h4>
                      <p className="text-xs text-white/60">Local restaurants, venues, and spaces</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                      <h4 className="text-sm font-mono text-white mb-2">Manage Guests</h4>
                      <p className="text-xs text-white/60">Invite and track attendance</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl h-[1px] bg-white/20 mx-auto mb-20"></div>

        {/* Features Section */}
        <section className="relative z-10 flex flex-col items-center py-20 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-block px-4 py-2 bg-white/5 border border-white/10">
                <span className="text-xs font-mono text-white">
                  Event Planning Features
                </span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-mono text-white mb-4 max-w-4xl mx-auto"
            >
              Everything you need for private event coordination
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm font-mono text-white/70 mb-16 max-w-2xl mx-auto"
            >
              From birthday parties to corporate meetings, connect with local venues and service providers in Saskatoon.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Event Creation Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="border border-white/10 bg-black/40 p-6 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-left group hover:shadow-lg hover:shadow-white/5"
              >
                <motion.div
                  className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Globe className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-mono text-white mb-3">
                  Event Creation
                </h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Plan birthdays, meetings, parties, and private gatherings with easy-to-use tools.
                </p>
              </motion.div>

              {/* Venue Discovery Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="border border-white/10 bg-black/40 p-6 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-left group hover:shadow-lg hover:shadow-white/5 cursor-pointer"
              >
                <div
                  className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors duration-300"
                >
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-mono text-white mb-3">
                  Category Discovery
                </h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Find restaurants, venues, and event spaces in Saskatoon with availability filtering.
                </p>
              </motion.div>

              {/* Guest Management Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="border border-white/10 bg-black/40 p-6 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-left group hover:shadow-lg hover:shadow-white/5"
              >
                <motion.div
                  className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-mono text-white mb-3">
                  Guest Management
                </h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Send invitations, track RSVPs, and manage guest lists with integrated calendar sync.
                </p>
              </motion.div>

              {/* Service Providers Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="border border-white/10 bg-black/40 p-6 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-left group hover:shadow-lg hover:shadow-white/5"
              >
                <motion.div
                  className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-mono text-white mb-3">
                  Service Providers
                </h3>
                <p className="text-xs font-mono text-white/60 leading-relaxed">
                  Connect with caterers, entertainers, and event coordinators in the Saskatoon area.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Animated Beam Section */}
        <section className="relative z-10 flex flex-col items-center py-20 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl font-mono text-white mb-4 max-w-4xl mx-auto"
            >
              Event Planning Ecosystem
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm font-mono text-white/70 mb-16 max-w-2xl mx-auto"
            >
              Connecting hosts, venues, and service providers through an integrated platform designed for Saskatoon.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative flex h-[400px] w-full items-center justify-center overflow-hidden"
              ref={containerRef}
            >
              <div className="flex size-full max-w-4xl flex-row items-stretch justify-between gap-10">
                {/* Frontend Column */}
                <div className="flex flex-col justify-center gap-4">
                  <Circle ref={div1Ref}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                    </svg>
                  </Circle>
                  <Circle ref={div2Ref}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </Circle>
                  <Circle ref={div3Ref}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
                    </svg>
                  </Circle>
                  <Circle ref={div4Ref}>
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z" />
                    </svg>
                  </Circle>
                </div>

                {/* Application Core */}
                <div className="flex flex-col justify-center">
                  <Circle ref={div6Ref} className="size-20">
                    <Image
                      src="/logo.png"
                      alt="CMPT370 Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </Circle>
                </div>

                {/* Backend Output */}
                <div className="flex flex-col justify-center">
                  <Circle ref={div7Ref} className="size-16">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </Circle>
                </div>
              </div>

              {/* AnimatedBeams */}
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div6Ref}
                duration={3}
                gradientStartColor="#ffffff"
                gradientStopColor="#000000"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div6Ref}
                duration={3}
                gradientStartColor="#ffffff"
                gradientStopColor="#000000"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div6Ref}
                duration={3}
                gradientStartColor="#ffffff"
                gradientStopColor="#000000"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div4Ref}
                toRef={div6Ref}
                duration={3}
                gradientStartColor="#ffffff"
                gradientStopColor="#000000"
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div7Ref}
                duration={3}
                gradientStartColor="#ffffff"
                gradientStopColor="#000000"
              />
            </motion.div>

            {/* Labels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-between max-w-4xl mx-auto mt-8"
            >
              <div className="text-center">
                <h4 className="text-sm font-mono text-white mb-2">
                  Event Hosts
                </h4>
                <p className="text-xs font-mono text-white/60">
                  Users & Organizations
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-mono text-white mb-2">Platform</h4>
                <p className="text-xs font-mono text-white/60">
                  Event Coordination
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-sm font-mono text-white mb-2">Service Providers</h4>
                <p className="text-xs font-mono text-white/60">
                  Venues & Vendors
                </p>
              </div>
            </motion.div>
          </div>
        </section>
        </div>
    </>
  );
}
