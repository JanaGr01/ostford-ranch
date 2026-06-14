"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";

type Horse = {
  id: string;
  name: string;
  barn_name: string | null;
  gender: string | null;
  age: string | null;
  breed: string | null;
  coat_color: string | null;
  discipline: string | null;
  status: string | null;
  image_url: string | null;
  created_at: string | null;
};

export default function HorsesPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [disciplineFilter, setDisciplineFilter] = useState("All Disciplines");
  const [genderFilter, setGenderFilter] = useState("All Genders");
  const [breedFilter, setBreedFilter] = useState("All Breeds");

  useEffect(() => {
    async function loadHorses() {
      const { data, error } = await supabase
        .from("horses")
        .select(
          "id, name, barn_name, gender, age, breed, coat_color, discipline, status, image_url, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setHorses(data || []);
      setIsLoading(false);
    }

    loadHorses();
  }, []);

  const availableBreeds = useMemo(() => {
    const breeds = horses
      .map((horse) => horse.breed)
      .filter((breed): breed is string => Boolean(breed && breed.trim()));

    return Array.from(new Set(breeds)).sort();
  }, [horses]);

  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        horse.name?.toLowerCase().includes(searchValue) ||
        horse.barn_name?.toLowerCase().includes(searchValue) ||
        horse.gender?.toLowerCase().includes(searchValue) ||
        horse.breed?.toLowerCase().includes(searchValue) ||
        horse.coat_color?.toLowerCase().includes(searchValue) ||
        horse.discipline?.toLowerCase().includes(searchValue) ||
        horse.status?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All Statuses" || horse.status === statusFilter;

      const matchesDiscipline =
        disciplineFilter === "All Disciplines" ||
        horse.discipline === disciplineFilter;

      const matchesGender =
        genderFilter === "All Genders" || horse.gender === genderFilter;

      const matchesBreed =
        breedFilter === "All Breeds" || horse.breed === breedFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDiscipline &&
        matchesGender &&
        matchesBreed
      );
    });
  }, [horses, searchTerm, statusFilter, disciplineFilter, genderFilter, breedFilter]);

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setDisciplineFilter("All Disciplines");
    setGenderFilter("All Genders");
    setBreedFilter("All Breeds");
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
        <section className="mx-auto max-w-6xl">
          <AppHeader />

          <p className="rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
            Loading horses...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
      <section className="mx-auto max-w-6xl">
        <AppHeader />

        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#D9C7B2] pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-bold">Horses</h1>
            <p className="mt-2 text-[#7A6A5A]">
              Browse all horse records from Ostford Ranch.
            </p>
          </div>

          <a
            href="/horses/new"
            className="rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c]"
          >
            Add Horse
          </a>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mb-6 rounded-3xl bg-[#FFFAF2] p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3 lg:col-span-2"
              placeholder="Search horses..."
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Retired</option>
              <option>Sold</option>
              <option>Deceased</option>
              <option>Reserved</option>
            </select>

            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
              className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
            >
              <option>All Genders</option>
              <option>Mare</option>
              <option>Stallion</option>
              <option>Gelding</option>
              <option>Filly</option>
              <option>Colt</option>
            </select>

            <select
              value={disciplineFilter}
              onChange={(event) => setDisciplineFilter(event.target.value)}
              className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
            >
              <option>All Disciplines</option>
              <option>Dressage</option>
              <option>Show Jumping</option>
              <option>Eventing</option>
              <option>Western</option>
              <option>Racing</option>
              <option>Breeding</option>
              <option>Leisure</option>
              <option>Untrained</option>
            </select>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
            <select
              value={breedFilter}
              onChange={(event) => setBreedFilter(event.target.value)}
              className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
            >
              <option>All Breeds</option>
              {availableBreeds.map((breed) => (
                <option key={breed}>{breed}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full px-5 py-3 text-sm font-semibold text-[#5B3A29] hover:bg-[#F6EFE5]"
            >
              Clear Filters
            </button>
          </div>
        </section>

        <p className="mb-4 text-sm text-[#7A6A5A]">
          Showing {filteredHorses.length} of {horses.length} horses
        </p>

        {filteredHorses.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredHorses.map((horse) => (
              <article
                key={horse.id}
                className="overflow-hidden rounded-3xl bg-[#FFFAF2] shadow-sm"
              >
                {horse.image_url ? (
                  <img
                    src={horse.image_url}
                    alt={horse.name}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-[#D9C7B2] text-sm font-medium text-[#7A6A5A]">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">{horse.name}</h2>

                    {horse.barn_name && (
                      <p className="mt-1 text-[#7A6A5A]">
                        &quot;{horse.barn_name}&quot;
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      {horse.gender || "Unknown"} · {horse.age || "Age unknown"}
                    </p>
                    <p>
                      {horse.breed || "Unknown breed"} ·{" "}
                      {horse.coat_color || "Unknown color"}
                    </p>
                    <p>Discipline: {horse.discipline || "Not set"}</p>
                    <p>Status: {horse.status || "Active"}</p>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <a
                      href={`/horses/${horse.id}`}
                      className="rounded-full bg-[#5B3A29] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3f281c]"
                    >
                      View Profile
                    </a>

                    <a
                      href={`/horses/${horse.id}/edit`}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-[#5B3A29] hover:bg-[#F6EFE5]"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-[#D9C7B2] bg-[#FFFAF2] p-10 text-center text-[#7A6A5A]">
            No horses found.
          </section>
        )}
      </section>
    </main>
  );
}