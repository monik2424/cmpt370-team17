"use client";

import { Car, Footprints, Bike, X } from "lucide-react";

interface TravelInfo {
  driving?: { distance: number; duration: number };
  walking?: { distance: number; duration: number };
  cycling?: { distance: number; duration: number };
}

interface TrackingPopupProps {
  eventTitle: string;
  travelInfo: TravelInfo;
  onStopTracking: () => void;
}

export default function TrackingPopup({
  eventTitle,
  travelInfo,
  onStopTracking,
}: TrackingPopupProps) {
  const fmtKm = (m: number) => (m / 1000).toFixed(1) + " km";
  const fmtMin = (s: number) => Math.round(s / 60) + " min";

  return (
    <div className="w-full rounded-t-xl border border-[#2a2a2a] bg-[#111111] p-4 text-white shadow-2xl ring-1 ring-black/50">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-400">
            Tracking Route To
          </div>
          <div className="text-base font-semibold text-white leading-tight">
            {eventTitle}
          </div>
        </div>

        <button
          onClick={onStopTracking}
          className="flex items-center gap-1 rounded-md bg-[#1a1a1a] px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-[#2a2a2a] hover:bg-[#1f1f1f]"
        >
          <X className="h-3 w-3" />
          <span>Stop</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {/* Car */}
        <div className="rounded-md bg-[#1a1a1a] p-3 ring-1 ring-[#2a2a2a]">
          <div className="mb-1 flex items-center gap-2 text-yellow-400">
            <Car className="h-4 w-4" />
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              Car
            </span>
          </div>
          {travelInfo.driving ? (
            <>
              <div className="text-white text-sm font-semibold leading-tight">
                {fmtMin(travelInfo.driving.duration)}
              </div>
              <div className="text-[11px] text-gray-400">
                {fmtKm(travelInfo.driving.distance)}
              </div>
            </>
          ) : (
            <div className="text-[11px] text-gray-500">No route</div>
          )}
        </div>

        {/* Walk */}
        <div className="rounded-md bg-[#1a1a1a] p-3 ring-1 ring-[#2a2a2a]">
          <div className="mb-1 flex items-center gap-2 text-yellow-400">
            <Footprints className="h-4 w-4" />
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              Walk
            </span>
          </div>
          {travelInfo.walking ? (
            <>
              <div className="text-white text-sm font-semibold leading-tight">
                {fmtMin(travelInfo.walking.duration)}
              </div>
              <div className="text-[11px] text-gray-400">
                {fmtKm(travelInfo.walking.distance)}
              </div>
            </>
          ) : (
            <div className="text-[11px] text-gray-500">No route</div>
          )}
        </div>

        {/* Bike */}
        <div className="rounded-md bg-[#1a1a1a] p-3 ring-1 ring-[#2a2a2a]">
          <div className="mb-1 flex items-center gap-2 text-yellow-400">
            <Bike className="h-4 w-4" />
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              Bike
            </span>
          </div>
          {travelInfo.cycling ? (
            <>
              <div className="text-white text-sm font-semibold leading-tight">
                {fmtMin(travelInfo.cycling.duration)}
              </div>
              <div className="text-[11px] text-gray-400">
                {fmtKm(travelInfo.cycling.distance)}
              </div>
            </>
          ) : (
            <div className="text-[11px] text-gray-500">No route</div>
          )}
        </div>
      </div>
    </div>
  );
}
