import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";

type HorseOption = {
  id: string;
  name: string;
  barn_name: string | null;
  gender: string | null;
  breed: string | null;
  image_url: string | null;
};

type BreedingPlan = {
  id: string;
  sire_id: string | null;
  dam_id: string | null;
  sire_name: string | null;
  dam_name: string | null;
  planned_foal_name: string | null;
  expected_birth_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  sire?: HorseOption | null;
  dam?: HorseOption | null;
};

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Not set";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getHorseDisplayName(horse: HorseOption | null | undefined, fallback: string | null) {
  if (horse) {
    return horse.barn_name ? `${horse.name} "${horse.barn_name}"` : horse.name;
  }

  return fallback || "Not set";
}

async function createBreedingPlan(formData: FormData) {
  "use server";

  const sireIdValue = formData.get("sire_id")?.toString() || "";
  const damIdValue = formData.get("dam_id")?.toString() || "";

  const sireName = formData.get("sire_name")?.toString().trim() || null;
  const damName = formData.get("dam_name")?.toString().trim() || null;

  const plannedFoalName =
    formData.get("planned_foal_name")?.toString().trim() || null;

  const expectedBirthDate =
    formData.get("expected_birth_date")?.toString() || null;

  const status = formData.get("status")?.toString() || "Planned";
  const notes = formData.get("notes")?.toString().trim() || null;

  const { error } = await supabase.from("breeding_plans").insert({
    sire_id: sireIdValue || null,
    dam_id: damIdValue || null,
    sire_name: sireName,
    dam_name: damName,
    planned_foal_name: plannedFoalName,
    expected_birth_date: expectedBirthDate,
    status,
    notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/breeding-planner");
}

export default async function BreedingPlannerPage() {
  const { data: horsesData, error: horsesError } = await supabase
    .from("horses")
    .select("id, name, barn_name, gender, breed, image_url")
    .order("name", { ascending: true });

  const { data: plansData, error: plansError } = await supabase
    .from("breeding_plans")
    .select(
      `
      id,
      sire_id,
      dam_id,
      sire_name,
      dam_name,
      planned_foal_name,
      expected_birth_date,
      status,
      notes,
      created_at,
      sire:horses!breeding_plans_sire_id_fkey (
        id,
        name,
        barn_name,
        gender,
        breed,
        image_url
      ),
      dam:horses!breeding_plans_dam_id_fkey (
        id,
        name,
        barn_name,
        gender,
        breed,
        image_url
      )
    `
    )
    .order("created_at", { ascending: false });

  const horses = (horsesData || []) as HorseOption[];
  const plans = (plansData || []) as BreedingPlan[];

  const mares = horses.filter((horse) =>
    ["Mare", "Filly"].includes(horse.gender || "")
  );

  const sires = horses.filter((horse) =>
    ["Stallion", "Colt", "Gelding"].includes(horse.gender || "")
  );

  return (
    <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
      <section className="mx-auto max-w-6xl">
        <AppHeader />

        <section className="mb-8 rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Breeding Planner</h1>
          <p className="mt-3 max-w-3xl text-[#7A6A5A]">
            Plan future pairings, expected foals, birth dates, and breeding notes
            for Ostford Ranch.
          </p>
        </section>

        {(horsesError || plansError) && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {horsesError?.message || plansError?.message}
          </div>
        )}

        <section className="mb-8 rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
          <h2 className="mb-5 text-2xl font-semibold">Create Breeding Plan</h2>

          <form action={createBreedingPlan} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Select Sire
                </span>
                <select
                  name="sire_id"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                >
                  <option value="">No internal sire selected</option>
                  {sires.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name}
                      {horse.barn_name ? ` "${horse.barn_name}"` : ""} ·{" "}
                      {horse.gender || "Unknown"} · {horse.breed || "Unknown breed"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  External Sire Name
                </span>
                <input
                  name="sire_name"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  placeholder="Optional external sire"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Select Dam
                </span>
                <select
                  name="dam_id"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                >
                  <option value="">No internal dam selected</option>
                  {mares.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name}
                      {horse.barn_name ? ` "${horse.barn_name}"` : ""} ·{" "}
                      {horse.gender || "Unknown"} · {horse.breed || "Unknown breed"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  External Dam Name
                </span>
                <input
                  name="dam_name"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  placeholder="Optional external dam"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Planned Foal Name
                </span>
                <input
                  name="planned_foal_name"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                  placeholder="Optional planned foal name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Expected Birth Date
                </span>
                <input
                  type="date"
                  name="expected_birth_date"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Status</span>
                <select
                  name="status"
                  defaultValue="Planned"
                  className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                >
                  <option>Planned</option>
                  <option>In Progress</option>
                  <option>Foal Born</option>
                  <option>Cancelled</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Notes</span>
              <textarea
                name="notes"
                rows={5}
                className="w-full rounded-xl border border-[#D9C7B2] bg-white px-4 py-3"
                placeholder="Add breeding notes, color expectations, roleplay plans, or conditions..."
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-[#5B3A29] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3f281c]"
            >
              Add Breeding Plan
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-semibold">Planned Breedings</h2>
              <p className="mt-2 text-sm text-[#7A6A5A]">
                Showing {plans.length} breeding plan{plans.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>

          {plans.length > 0 ? (
            <div className="grid gap-5">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-3xl border border-[#E5D6C4] bg-white p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="w-full">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#5B3A29] px-3 py-1 text-xs font-semibold text-white">
                          {plan.status || "Planned"}
                        </span>

                        <span className="text-sm text-[#7A6A5A]">
                          Expected birth: {formatDate(plan.expected_birth_date)}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold">
                        {plan.planned_foal_name || "Unnamed planned foal"}
                      </h3>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-[#FFFAF2] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                            Sire
                          </p>

                          {plan.sire ? (
                            <a
                              href={`/horses/${plan.sire.id}`}
                              className="mt-2 block text-lg font-semibold text-[#5B3A29] hover:underline"
                            >
                              {getHorseDisplayName(plan.sire, plan.sire_name)}
                            </a>
                          ) : (
                            <p className="mt-2 text-lg font-semibold">
                              {getHorseDisplayName(null, plan.sire_name)}
                            </p>
                          )}

                          {plan.sire && (
                            <p className="mt-1 text-sm text-[#7A6A5A]">
                              {plan.sire.gender || "Unknown"} ·{" "}
                              {plan.sire.breed || "Unknown breed"}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl bg-[#FFFAF2] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                            Dam
                          </p>

                          {plan.dam ? (
                            <a
                              href={`/horses/${plan.dam.id}`}
                              className="mt-2 block text-lg font-semibold text-[#5B3A29] hover:underline"
                            >
                              {getHorseDisplayName(plan.dam, plan.dam_name)}
                            </a>
                          ) : (
                            <p className="mt-2 text-lg font-semibold">
                              {getHorseDisplayName(null, plan.dam_name)}
                            </p>
                          )}

                          {plan.dam && (
                            <p className="mt-1 text-sm text-[#7A6A5A]">
                              {plan.dam.gender || "Unknown"} ·{" "}
                              {plan.dam.breed || "Unknown breed"}
                            </p>
                          )}
                        </div>
                      </div>

                      {plan.notes && (
                        <p className="mt-5 whitespace-pre-line leading-relaxed text-[#4A3A2D]">
                          {plan.notes}
                        </p>
                      )}
                    </div>

                    <form action={`/breeding-planner/${plan.id}/delete`} method="POST">
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-10 text-center text-[#7A6A5A]">
              No breeding plans yet.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}