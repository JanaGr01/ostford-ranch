"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ShowResult = {
  id: string;
  horse_id: string;
  event_name: string;
  show_date: string | null;
  show_class: string | null;
  placement: string | null;
  score: string | null;
  judge: string | null;
  notes: string | null;
  created_at: string | null;
};

type HorseShowResultsProps = {
  horseId: string;
};

export default function HorseShowResults({ horseId }: HorseShowResultsProps) {
  const [results, setResults] = useState<ShowResult[]>([]);

  const [eventName, setEventName] = useState("");
  const [showDate, setShowDate] = useState("");
  const [showClass, setShowClass] = useState("");
  const [placement, setPlacement] = useState("");
  const [score, setScore] = useState("");
  const [judge, setJudge] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadShowResults() {
      const { data, error } = await supabase
        .from("horse_show_results")
        .select(
          "id, horse_id, event_name, show_date, show_class, placement, score, judge, notes, created_at"
        )
        .eq("horse_id", horseId)
        .order("show_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setResults(data || []);
      setIsLoading(false);
    }

    loadShowResults();
  }, [horseId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventName.trim()) {
      setErrorMessage("Please enter an event name.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const { data: insertedResult, error } = await supabase
      .from("horse_show_results")
      .insert({
        horse_id: horseId,
        event_name: eventName.trim(),
        show_date: showDate || null,
        show_class: showClass.trim() || null,
        placement: placement.trim() || null,
        score: score.trim() || null,
        judge: judge.trim() || null,
        notes: notes.trim() || null,
      })
      .select(
        "id, horse_id, event_name, show_date, show_class, placement, score, judge, notes, created_at"
      )
      .single();

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setResults((currentResults) =>
      insertedResult ? [insertedResult, ...currentResults] : currentResults
    );

    setEventName("");
    setShowDate("");
    setShowClass("");
    setPlacement("");
    setScore("");
    setJudge("");
    setNotes("");
    setIsSaving(false);
  }

  async function handleDelete(resultId: string) {
    const confirmed = confirm("Are you sure you want to delete this show result?");

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("horse_show_results")
      .delete()
      .eq("id", resultId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setResults((currentResults) =>
      currentResults.filter((result) => result.id !== resultId)
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
        <h2 className="text-2xl font-semibold">Show Results</h2>
        <p className="mt-2 text-sm text-[#7A6A5A]">
          Track competitions, placements, scores, judges, and show notes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-[#E5D6C4] bg-white p-5"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Event Name</span>
            <input
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="Winter Dressage Cup"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Date</span>
            <input
              type="date"
              value={showDate}
              onChange={(event) => setShowDate(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Class</span>
            <input
              value={showClass}
              onChange={(event) => setShowClass(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="Intro Dressage"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Placement</span>
            <input
              value={placement}
              onChange={(event) => setPlacement(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="2nd Place"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Score</span>
            <input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="78%"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Judge</span>
            <input
              value={judge}
              onChange={(event) => setJudge(event.target.value)}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="Judge name"
            />
          </label>

          <label className="block md:col-span-3">
            <span className="mb-2 block text-sm font-semibold">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              placeholder="Add show notes, roleplay details, or judging feedback..."
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Add Show Result"}
        </button>
      </form>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[#7A6A5A]">Loading show results...</p>
      ) : results.length > 0 ? (
        <div className="space-y-5">
          {results.map((result) => (
            <article
              key={result.id}
              className="rounded-3xl border border-[#E5D6C4] bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div className="w-full">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {result.placement && (
                      <span className="rounded-full bg-[#5B3A29] px-3 py-1 text-xs font-semibold text-white">
                        {result.placement}
                      </span>
                    )}

                    <span className="text-sm text-[#7A6A5A]">
                      {formatDate(result.show_date)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold">{result.event_name}</h3>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-[#FFFAF2] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                        Class
                      </p>
                      <p className="mt-1">{result.show_class || "Not set"}</p>
                    </div>

                    <div className="rounded-2xl bg-[#FFFAF2] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                        Score
                      </p>
                      <p className="mt-1">{result.score || "Not set"}</p>
                    </div>

                    <div className="rounded-2xl bg-[#FFFAF2] px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                        Judge
                      </p>
                      <p className="mt-1">{result.judge || "Not set"}</p>
                    </div>
                  </div>

                  {result.notes && (
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-[#4A3A2D]">
                      {result.notes}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(result.id)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-8 text-center text-sm text-[#7A6A5A]">
          No show results yet.
        </div>
      )}
    </section>
  );
}