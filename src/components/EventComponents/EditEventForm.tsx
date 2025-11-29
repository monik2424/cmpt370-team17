"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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
  other: "Other",
};

interface Provider {
  id: string;
  businessName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditEventFormProps {
  event: {
    image?: string | null;
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    startAt: string | Date;
    private: boolean;
    providerId?: string | null;
    categoryTags?: { nameTag: string }[];
  };
}

export default function EditEventForm({ event }: EditEventFormProps ) {
  const router = useRouter();
  const iso =
    event.startAt instanceof Date
      ? event.startAt.toISOString()
      : new Date(event.startAt).toISOString();

  // Strip ", Saskatoon, SK" from stored location so user only sees the street
  const fullLocation = event.location ?? "";
  const initialStreet = fullLocation.replace(
    /,\s*Saskatoon,\s*SK\s*$/i,
    ""
  );

  // Derive initial category key from first categoryTag (if present)
  const initialCategoryKey = (() => {
    const label = event.categoryTags?.[0]?.nameTag;
    if (!label) return "";
    const match = Object.entries(categoryNames).find(
      ([, v]) => v === label
    );
    return match?.[0] ?? "";
  })();

  const [imagePreview, setImagePreview] = useState<string | null>(
  event.image ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
  fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErr("Image must be less than 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form state (mirrors EventCreateForm)
  const [name, setName] = useState(event.name);
  const [desc, setDesc] = useState(event.description ?? "");
  const [location, setLocation] = useState(initialStreet);
  const [date, setDate] = useState(iso.substring(0, 10)); // yyyy-mm-dd
  const [time, setTime] = useState(iso.substring(11, 16)); // HH:mm
  const [isPrivate, setIsPrivate] = useState(event.private);
  const [categoryKey, setCategoryKey] = useState(initialCategoryKey);
  const [providerId, setProviderId] = useState(event.providerId ?? "");

  // Provider-related state (same as create form)
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Fetch providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch("/api/providers");
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setProvidersLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    let imageBase64: string | undefined;
    if (imageFile) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(imageFile);
      });
    }

    // Basic client side validation (same as create)
    if (!name.trim()) return setErr("Please enter a name.");
    if (!date || !time) return setErr("Please pick a date and time.");
    if (!location.trim()) return setErr("Please enter a street address.");
    if (!categoryKey) return setErr("Please select a category.");

    const finalLocation = `${location.trim()}, Saskatoon, SK`;

    const categoryDisplay = categoryNames[categoryKey] ?? categoryKey;
    const tagList = [categoryDisplay]; // keep tags shape: string[]

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          name,
          desc,
          date,
          time,
          location: finalLocation,
          isPrivate,
          tags: tagList,
          categoryKey,
          providerId: providerId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Failed to update event.");
      } else {
        setOk("Event updated!");
        router.push("/events");
        router.refresh();
      }
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Event Image</label>

        <div className="flex items-center gap-4">
          <div
            onClick={handleImageClick}
            className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer group"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Event"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 text-center">
                Click to add image
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white">Change</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <div>
            <button
              type="button"
              onClick={handleImageClick}
              className="px-3 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Upload Image
            </button>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG, or GIF. Max 2MB.
            </p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Event name</label>
        <input
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="Edit Event name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="Add Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Street Address</label>
        <input
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          placeholder="102 Spadina Crescent E"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Street number and name (e.g. &quot;105 Administration Pl&quot;). “Saskatoon, SK”
          is added automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2 dark:bg-gray-900"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            className="w-full rounded border px-3 py-2 dark:bg-gray-900"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm">Private event</span>
          </label>
        </div>
      </div>

      {/* Category dropdown – same as create form */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          value={categoryKey}
          onChange={(e) => setCategoryKey(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a category</option>
          {Object.entries(categoryNames).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Pick one category. It will also be used as the event&apos;s tag.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Service Provider (Optional)
        </label>
        <select
          className="w-full rounded border px-3 py-2 dark:bg-gray-900"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          disabled={loading || providersLoading}
        >
          <option value="">No provider selected</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.businessName}
              {provider.address && ` - ${provider.address}`}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {providersLoading
            ? "Loading providers..."
            : "Select a service provider for your event (catering, entertainment, etc.)"}
        </p>
      </div>

      <ShimmerButton
        type="submit"
        disabled={loading}
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        shimmerColor="#ffffff"
        shimmerDuration="2s"
        borderRadius="8px"
        className="disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Saving…" : "Save Changes"}
      </ShimmerButton>

      {ok && <div className="text-green-600 text-sm">{ok}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </form>
  );
}