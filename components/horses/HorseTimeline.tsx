"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TimelineEntry = {
  id: string;
  horse_id: string;
  title: string;
  entry_type: string | null;
  entry_date: string | null;
  content: string | null;
  created_at: string | null;
};

type HorseTimelineProps = {
  horseId: string;
};

export default function HorseTimeline({ horseId }: HorseTimelineProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [title, setTitle] = useState("");
  const [entryType, setEntryType] = useState("Story");
  const [entryDate, setEntryDate] = useState("");
  const [content, setContent] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      setIsLoggedIn(Boolean(data.session));
      setIsAuthLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadTimelineEntries() {
      const { data, error } = await supabase
        .from("horse_timeline_entries")
        .select("id, horse_id, title, entry_type, entry_date, content, created_at")
        .eq("horse_id", horseId)
        .order("entry_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setEntries(data || []);
      setIsLoading(false);
    }

    loadTimelineEntries();
  }, [horseId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      setErrorMessage("You need to sign in to add timeline entries.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter a title.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const { data: insertedEntry, error } = await supabase
      .from("horse_timeline_entries")
      .insert({
        horse_id: horseId,
        title: title.trim(),
        entry_type: entryType,
        entry_date: entryDate || null,
        content: content.trim() || null,
      })
      .select("id, horse_id, title, entry_type, entry_date, content, created_at")
      .single();

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setEntries((currentEntries) =>
      insertedEntry ? [insertedEntry, ...currentEntries] : currentEntries
    );

    setTitle("");
    setEntryType("Story");
    setEntryDate("");
    setContent("");
    setIsSaving(false);
  }

  async function handleDelete(entryId: string) {
    if (!isLoggedIn) {
      setErrorMessage("You need to sign in to delete timeline entries.");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete this timeline entry?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("horse_timeline_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== entryId)
    );
  }

  function formatDate(dateValue: string | null) {
    if (!dateValue) {
      return "No date";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Story Timeline</h2>
        <p className="mt-2 text-sm text-[#7A6A5A]">
          Roleplay moments, training updates, breeding notes, and important
          events.
        </p>
      </div>

      {!isAuthLoading && isLoggedIn && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-[#E5D6C4] bg-white p-5"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Arrival at Ostford Ranch"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Type</span>
              <select
                value={entryType}
                onChange={(event) => setEntryType(event.target.value)}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              >
                <option>Story</option>
                <option>Training</option>
                <option>Breeding</option>
                <option>Show</option>
                <option>Health</option>
                <option>Sale</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Date</span>
              <input
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Content</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Write a short story note or update..."
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-5 rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Add Timeline Entry"}
          </button>
        </form>
      )}

      {!isAuthLoading && !isLoggedIn && (
        <div className="mb-8 rounded-2xl border border-[#E5D6C4] bg-white p-5 text-sm text-[#7A6A5A]">
          Sign in to add or delete timeline entries.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[#7A6A5A]">Loading timeline...</p>
      ) : entries.length > 0 ? (
        <div className="space-y-5">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="relative rounded-3xl border border-[#E5D6C4] bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#5B3A29] px-3 py-1 text-xs font-semibold text-white">
                      {entry.entry_type || "Story"}
                    </span>

                    <span className="text-sm text-[#7A6A5A]">
                      {formatDate(entry.entry_date)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold">{entry.title}</h3>

                  {entry.content && (
                    <p className="mt-3 whitespace-pre-line leading-relaxed text-[#4A3A2D]">
                      {entry.content}
                    </p>
                  )}
                </div>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-8 text-center text-sm text-[#7A6A5A]">
          No timeline entries yet.
        </div>
      )}
    </section>
  );
}