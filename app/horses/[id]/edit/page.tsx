"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";
import RequireAuth from "@/components/auth/RequireAuth";

type HorseFormData = {
  name: string;
  barn_name: string;
  gender: string;
  age: string;
  breed: string;
  coat_color: string;
  height: string;
  discipline: string;
  status: string;
  owner: string;
  breeder: string;
  sire_id: string;
  dam_id: string;
  sire_name: string;
  dam_name: string;
  personality: string;
  background_story: string;
  notes: string;
  image_url: string;
};

type PedigreeHorse = {
  id: string;
  name: string;
  barn_name: string | null;
};

export default function EditHorsePage() {
  const router = useRouter();
  const params = useParams();
  const horseId = String(params.id);

  const [horse, setHorse] = useState<HorseFormData>({
    name: "",
    barn_name: "",
    gender: "",
    age: "",
    breed: "",
    coat_color: "",
    height: "",
    discipline: "",
    status: "Active",
    owner: "Ostford Ranch",
    breeder: "",
    sire_id: "",
    dam_id: "",
    sire_name: "",
    dam_name: "",
    personality: "",
    background_story: "",
    notes: "",
    image_url: "",
  });

  const [availableHorses, setAvailableHorses] = useState<PedigreeHorse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function uploadHorseImage(file: File) {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    const filePath = `horses/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("horse-images")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("horse-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  useEffect(() => {
    async function loadData() {
      const { data: horseData, error: horseError } = await supabase
        .from("horses")
        .select("*")
        .eq("id", horseId)
        .single();

      if (horseError || !horseData) {
        setErrorMessage(horseError?.message || "Horse could not be loaded.");
        setIsLoading(false);
        return;
      }

      const { data: pedigreeData, error: pedigreeError } = await supabase
        .from("horses")
        .select("id, name, barn_name")
        .neq("id", horseId)
        .order("name", { ascending: true });

      if (pedigreeError) {
        setErrorMessage(pedigreeError.message);
        setIsLoading(false);
        return;
      }

      setAvailableHorses(pedigreeData || []);

      setHorse({
        name: horseData.name || "",
        barn_name: horseData.barn_name || "",
        gender: horseData.gender || "",
        age: horseData.age || "",
        breed: horseData.breed || "",
        coat_color: horseData.coat_color || "",
        height: horseData.height || "",
        discipline: horseData.discipline || "",
        status: horseData.status || "Active",
        owner: horseData.owner || "Ostford Ranch",
        breeder: horseData.breeder || "",
        sire_id: horseData.sire_id || "",
        dam_id: horseData.dam_id || "",
        sire_name: horseData.sire_name || "",
        dam_name: horseData.dam_name || "",
        personality: horseData.personality || "",
        background_story: horseData.background_story || "",
        notes: horseData.notes || "",
        image_url: horseData.image_url || "",
      });

      setIsLoading(false);
    }

    loadData();
  }, [horseId]);

  function updateField(field: keyof HorseFormData, value: string) {
    setHorse((currentHorse) => ({
      ...currentHorse,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    if (!horse.name.trim()) {
      setErrorMessage("Name is required.");
      setIsSaving(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const imageFile = formData.get("image_file");

    try {
      let updatedImageUrl = horse.image_url;

      if (imageFile instanceof File && imageFile.size > 0) {
        updatedImageUrl = await uploadHorseImage(imageFile);
      }

      const updatedHorse = {
        name: horse.name,
        barn_name: horse.barn_name,
        gender: horse.gender,
        age: horse.age,
        breed: horse.breed,
        coat_color: horse.coat_color,
        height: horse.height,
        discipline: horse.discipline,
        status: horse.status,
        owner: horse.owner,
        breeder: horse.breeder,
        sire_id: horse.sire_id || null,
        dam_id: horse.dam_id || null,
        sire_name: horse.sire_name,
        dam_name: horse.dam_name,
        personality: horse.personality,
        background_story: horse.background_story,
        notes: horse.notes,
        image_url: updatedImageUrl,
      };

      const { error } = await supabase
        .from("horses")
        .update(updatedHorse)
        .eq("id", horseId);

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      router.push(`/horses/${horseId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong while updating the horse.");
      }

      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
        <section className="mx-auto max-w-4xl">
          <p className="rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
            Loading horse...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
      <section className="mx-auto max-w-4xl">
        <AppHeader />

        <RequireAuth>

        <div className="mb-8 border-b border-[#D9C7B2] pb-6">
          <a
            href={`/horses/${horseId}`}
            className="text-sm font-medium text-[#7A6A5A] hover:text-[#5B3A29]"
          >
            ← Back to Horse Profile
          </a>

          <h1 className="mt-4 text-4xl font-bold">Edit Horse</h1>
          <p className="mt-2 text-[#7A6A5A]">
            Update this horse record for Ostford Ranch.
          </p>
        </div>
        </RequireAuth>
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl bg-[#FFFAF2] p-8 shadow-sm"
        >
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={horse.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Name"
              />

              <input
                value={horse.barn_name}
                onChange={(e) => updateField("barn_name", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Barn Name"
              />

              <select
                value={horse.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              >
                <option value="">Gender</option>
                <option value="Mare">Mare</option>
                <option value="Stallion">Stallion</option>
                <option value="Gelding">Gelding</option>
                <option value="Filly">Filly</option>
                <option value="Colt">Colt</option>
              </select>

              <input
                value={horse.age}
                onChange={(e) => updateField("age", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Age"
              />

              <input
                value={horse.breed}
                onChange={(e) => updateField("breed", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Breed"
              />

              <input
                value={horse.coat_color}
                onChange={(e) => updateField("coat_color", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Coat Color"
              />

              <input
                value={horse.height}
                onChange={(e) => updateField("height", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Height"
              />

              <select
                value={horse.discipline}
                onChange={(e) => updateField("discipline", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              >
                <option value="">Discipline</option>
                <option value="Dressage">Dressage</option>
                <option value="Show Jumping">Show Jumping</option>
                <option value="Eventing">Eventing</option>
                <option value="Western">Western</option>
                <option value="Racing">Racing</option>
                <option value="Breeding">Breeding</option>
                <option value="Leisure">Leisure</option>
                <option value="Untrained">Untrained</option>
              </select>

              <select
                value={horse.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
              >
                <option value="Active">Active</option>
                <option value="Retired">Retired</option>
                <option value="Sold">Sold</option>
                <option value="Deceased">Deceased</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Ownership</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={horse.owner}
                onChange={(e) => updateField("owner", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Owner"
              />

              <input
                value={horse.breeder}
                onChange={(e) => updateField("breeder", e.target.value)}
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Breeder"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Pedigree</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <select
                  value={horse.sire_id}
                  onChange={(e) => updateField("sire_id", e.target.value)}
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                >
                  <option value="">Select existing sire</option>
                  {availableHorses.map((pedigreeHorse) => (
                    <option key={pedigreeHorse.id} value={pedigreeHorse.id}>
                      {pedigreeHorse.name}
                      {pedigreeHorse.barn_name
                        ? ` "${pedigreeHorse.barn_name}"`
                        : ""}
                    </option>
                  ))}
                </select>

                <input
                  value={horse.sire_name}
                  onChange={(e) => updateField("sire_name", e.target.value)}
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  placeholder="External sire name"
                />
              </div>

              <div className="space-y-3">
                <select
                  value={horse.dam_id}
                  onChange={(e) => updateField("dam_id", e.target.value)}
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                >
                  <option value="">Select existing dam</option>
                  {availableHorses.map((pedigreeHorse) => (
                    <option key={pedigreeHorse.id} value={pedigreeHorse.id}>
                      {pedigreeHorse.name}
                      {pedigreeHorse.barn_name
                        ? ` "${pedigreeHorse.barn_name}"`
                        : ""}
                    </option>
                  ))}
                </select>

                <input
                  value={horse.dam_name}
                  onChange={(e) => updateField("dam_name", e.target.value)}
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  placeholder="External dam name"
                />
              </div>
            </div>

            <p className="mt-3 text-sm text-[#7A6A5A]">
              Choose an existing horse or enter an external parent name if the
              parent is not listed.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Roleplay</h2>

            <div className="space-y-4">
              <textarea
                value={horse.personality}
                onChange={(e) => updateField("personality", e.target.value)}
                className="min-h-28 w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Personality"
              />

              <textarea
                value={horse.background_story}
                onChange={(e) =>
                  updateField("background_story", e.target.value)
                }
                className="min-h-36 w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Background Story"
              />

              <textarea
                value={horse.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="min-h-28 w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Notes"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Media</h2>

            {horse.image_url ? (
              <div className="mb-4 overflow-hidden rounded-2xl border border-[#D9C7B2] bg-white">
                <img
                  src={horse.image_url}
                  alt={horse.name}
                  className="h-64 w-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-4 flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#D9C7B2] bg-white text-sm text-[#7A6A5A]">
                No image uploaded yet.
              </div>
            )}

            <label className="block rounded-2xl border border-dashed border-[#D9C7B2] bg-white p-6">
              <span className="block text-sm font-semibold text-[#5B3A29]">
                Replace Main Image
              </span>
              <span className="mt-1 block text-sm text-[#7A6A5A]">
                Choose a new image only if you want to replace the current one.
              </span>

              <input
                name="image_file"
                type="file"
                accept="image/*"
                className="mt-4 block w-full text-sm text-[#7A6A5A]"
              />
            </label>
          </section>

          <div className="flex justify-end gap-3 border-t border-[#D9C7B2] pt-6">
            <a
              href={`/horses/${horseId}`}
              className="rounded-full px-5 py-3 text-sm font-semibold text-[#5B3A29] hover:bg-[#F6EFE5]"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#5B3A29] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3f281c] disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}