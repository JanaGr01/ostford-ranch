"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";
import RequireAuth from "@/components/auth/RequireAuth";

type PedigreeHorse = {
  id: string;
  name: string;
  barn_name: string | null;
};

export default function AddHorsePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [availableHorses, setAvailableHorses] = useState<PedigreeHorse[]>([]);

  useEffect(() => {
    async function loadAvailableHorses() {
      const { data, error } = await supabase
        .from("horses")
        .select("id, name, barn_name")
        .order("name", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setAvailableHorses(data || []);
    }

    loadAvailableHorses();
  }, []);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    let imageUrl = "";
    const imageFile = formData.get("image_file");

    try {
      if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await uploadHorseImage(imageFile);
      }

      const sireId = String(formData.get("sire_id") || "");
      const damId = String(formData.get("dam_id") || "");

      const horse = {
        name: String(formData.get("name") || ""),
        barn_name: String(formData.get("barn_name") || ""),
        gender: String(formData.get("gender") || ""),
        age: String(formData.get("age") || ""),
        breed: String(formData.get("breed") || ""),
        coat_color: String(formData.get("coat_color") || ""),
        height: String(formData.get("height") || ""),
        discipline: String(formData.get("discipline") || ""),
        status: String(formData.get("status") || "Active"),
        owner: String(formData.get("owner") || "Ostford Ranch"),
        breeder: String(formData.get("breeder") || ""),
        sire_id: sireId || null,
        dam_id: damId || null,
        sire_name: String(formData.get("sire_name") || ""),
        dam_name: String(formData.get("dam_name") || ""),
        personality: String(formData.get("personality") || ""),
        background_story: String(formData.get("background_story") || ""),
        notes: String(formData.get("notes") || ""),
        image_url: imageUrl,
      };

      if (!horse.name.trim()) {
        setErrorMessage("Name is required.");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from("horses").insert(horse);

      if (error) {
        setErrorMessage(error.message);
        setIsSaving(false);
        return;
      }

      router.push("/horses");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong while saving the horse.");
      }

      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
      <section className="mx-auto max-w-4xl">
        <AppHeader />

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Add Horse</h1>
          <p className="mt-2 text-[#7A6A5A]">
            Create a new horse record for Ostford Ranch.
          </p>
        </div>

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
                name="name"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Name"
              />

              <input
                name="barn_name"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Barn Name"
              />

              <select
                name="gender"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                defaultValue=""
              >
                <option value="" disabled>
                  Gender
                </option>
                <option value="Mare">Mare</option>
                <option value="Stallion">Stallion</option>
                <option value="Gelding">Gelding</option>
                <option value="Filly">Filly</option>
                <option value="Colt">Colt</option>
              </select>

              <input
                name="age"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Age"
              />

              <input
                name="breed"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Breed"
              />

              <input
                name="coat_color"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Coat Color"
              />

              <input
                name="height"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Height"
              />

              <select
                name="discipline"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                defaultValue=""
              >
                <option value="" disabled>
                  Discipline
                </option>
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
                name="status"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                defaultValue="Active"
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
                name="owner"
                defaultValue="Ostford Ranch"
                className="rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Owner"
              />

              <input
                name="breeder"
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
                  name="sire_id"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  defaultValue=""
                >
                  <option value="">Select existing sire</option>
                  {availableHorses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name}
                      {horse.barn_name ? ` "${horse.barn_name}"` : ""}
                    </option>
                  ))}
                </select>

                <input
                  name="sire_name"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  placeholder="External sire name"
                />
              </div>

              <div className="space-y-3">
                <select
                  name="dam_id"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  defaultValue=""
                >
                  <option value="">Select existing dam</option>
                  {availableHorses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name}
                      {horse.barn_name ? ` "${horse.barn_name}"` : ""}
                    </option>
                  ))}
                </select>

                <input
                  name="dam_name"
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
                name="personality"
                className="min-h-28 w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Personality"
              />

              <textarea
                name="background_story"
                className="min-h-36 w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Background Story"
              />

              <textarea
                name="notes"
                className="min-h-28 w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Notes"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Media</h2>

            <label className="block rounded-2xl border border-dashed border-[#D9C7B2] bg-white p-6">
              <span className="block text-sm font-semibold text-[#5B3A29]">
                Main Image
              </span>
              <span className="mt-1 block text-sm text-[#7A6A5A]">
                Upload a horse image from your computer.
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
              href="/"
              className="rounded-full px-5 py-3 text-sm font-semibold text-[#5B3A29] hover:bg-[#F6EFE5]"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#5B3A29] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3f281c] disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Horse"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}