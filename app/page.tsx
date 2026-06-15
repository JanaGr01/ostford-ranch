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

type TimelineEntry = {
  id: string;
  horse_id: string;
  title: string;
  entry_type: string | null;
  entry_date: string | null;
  content: string | null;
  created_at: string | null;
  horse?: {
    id: string;
    name: string;
    barn_name: string | null;
  } | null;
};

type BreedingPlan = {
  id: string;
  planned_foal_name: string | null;
  expected_birth_date: string | null;
  status: string | null;
  sire_name: string | null;
  dam_name: string | null;
  created_at: string | null;
  sire?: {
    id: string;
    name: string;
    barn_name: string | null;
  } | null;
  dam?: {
    id: string;
    name: string;
    barn_name: string | null;
  } | null;
};

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl bg-[#FFFAF2] p-5 shadow-sm">
      <p className="text-sm text-[#7A6A5A]">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

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

function getHorseName(
  horse: { name: string; barn_name: string | null } | null | undefined
) {
  if (!horse) {
    return "Unknown horse";
  }

  return horse.barn_name ? `${horse.name} "${horse.barn_name}"` : horse.name;
}

function getPlanHorseName(
  horse: { name: string; barn_name: string | null } | null | undefined,
  fallback: string | null
) {
  if (horse) {
    return horse.barn_name ? `${horse.name} "${horse.barn_name}"` : horse.name;
  }

  return fallback || "Not set";
}

function normalizeSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
}

export default async function Home() {
  const { data: horsesData, error: horsesError } = await supabase
    .from("horses")
    .select(
      "id, name, barn_name, gender, age, breed, coat_color, discipline, status, image_url, created_at"
    )
    .order("created_at", { ascending: false });

  const { count: galleryImageCount, error: galleryError } = await supabase
    .from("horse_gallery_images")
    .select("id", { count: "exact", head: true });

  const { data: timelineData, error: timelineError } = await supabase
    .from("horse_timeline_entries")
    .select(
      `
      id,
      horse_id,
      title,
      entry_type,
      entry_date,
      content,
      created_at,
      horse:horses (
        id,
        name,
        barn_name
      )
    `
    )
    .order("entry_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: timelineCount, error: timelineCountError } = await supabase
    .from("horse_timeline_entries")
    .select("id", { count: "exact", head: true });

  const { count: showResultCount, error: showResultsError } = await supabase
    .from("horse_show_results")
    .select("id", { count: "exact", head: true });

  const { data: breedingPlansData, error: breedingPlansError } = await supabase
    .from("breeding_plans")
    .select(
      `
      id,
      planned_foal_name,
      expected_birth_date,
      status,
      sire_name,
      dam_name,
      created_at,
      sire:horses!breeding_plans_sire_id_fkey (
        id,
        name,
        barn_name
      ),
      dam:horses!breeding_plans_dam_id_fkey (
        id,
        name,
        barn_name
      )
    `
    )
    .order("expected_birth_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: breedingPlanCount, error: breedingPlanCountError } =
    await supabase
      .from("breeding_plans")
      .select("id", { count: "exact", head: true });

  const horses = (horsesData || []) as Horse[];

  const rawTimelineEntries = (timelineData || []) as unknown as Array<
    Omit<TimelineEntry, "horse"> & {
      horse?: TimelineEntry["horse"] | TimelineEntry["horse"][];
    }
  >;

  const recentTimelineEntries: TimelineEntry[] = rawTimelineEntries.map(
    (entry) => ({
      ...entry,
      horse: normalizeSingleRelation(entry.horse),
    })
  );

  const rawBreedingPlans = (breedingPlansData || []) as unknown as Array<
    Omit<BreedingPlan, "sire" | "dam"> & {
      sire?: BreedingPlan["sire"] | BreedingPlan["sire"][];
      dam?: BreedingPlan["dam"] | BreedingPlan["dam"][];
    }
  >;

  const upcomingBreedingPlans: BreedingPlan[] = rawBreedingPlans.map((plan) => ({
    ...plan,
    sire: normalizeSingleRelation(plan.sire),
    dam: normalizeSingleRelation(plan.dam),
  }));

  const totalHorses = horses.length;
  const activeHorses = horses.filter((horse) => horse.status === "Active").length;
  const mares = horses.filter((horse) => horse.gender === "Mare").length;
  const stallions = horses.filter((horse) => horse.gender === "Stallion").length;

  const recentHorses = horses.slice(0, 3);

  const errorMessage =
    horsesError?.message ||
    galleryError?.message ||
    timelineError?.message ||
    timelineCountError?.message ||
    showResultsError?.message ||
    breedingPlansError?.message ||
    breedingPlanCountError?.message ||
    "";

  return (
    <main className="min-h-screen bg-[#F6EFE5] text-[#2B2118]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <AppHeader />

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mb-8 rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Ranch Dashboard</h1>
          <p className="mt-3 max-w-3xl text-[#7A6A5A]">
            Overview of horses, stories, gallery images, show records, and
            breeding plans at Ostford Ranch.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Horses" value={totalHorses} />
          <StatCard label="Active Horses" value={activeHorses} />
          <StatCard label="Mares" value={mares} />
          <StatCard label="Stallions" value={stallions} />
          <StatCard label="Gallery Images" value={galleryImageCount || 0} />
          <StatCard label="Timeline Entries" value={timelineCount || 0} />
          <StatCard label="Show Results" value={showResultCount || 0} />
          <StatCard label="Breeding Plans" value={breedingPlanCount || 0} />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold">Recent Timeline</h2>
                <p className="mt-2 text-sm text-[#7A6A5A]">
                  Latest roleplay and story updates.
                </p>
              </div>
            </div>

            {recentTimelineEntries.length > 0 ? (
              <div className="space-y-4">
                {recentTimelineEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-[#E5D6C4] bg-white p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#5B3A29] px-3 py-1 text-xs font-semibold text-white">
                        {entry.entry_type || "Story"}
                      </span>

                      <span className="text-sm text-[#7A6A5A]">
                        {formatDate(entry.entry_date)}
                      </span>
                    </div>

                    <h3 className="font-bold">{entry.title}</h3>

                    <a
                      href={`/horses/${entry.horse_id}`}
                      className="mt-1 inline-block text-sm font-semibold text-[#5B3A29] hover:underline"
                    >
                      {getHorseName(entry.horse)}
                    </a>

                    {entry.content && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#4A3A2D]">
                        {entry.content}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-8 text-center text-sm text-[#7A6A5A]">
                No timeline entries yet.
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold">Upcoming Foals</h2>
                <p className="mt-2 text-sm text-[#7A6A5A]">
                  Planned breedings and expected birth dates.
                </p>
              </div>

              <a
                href="/breeding-planner"
                className="rounded-full bg-[#5B3A29] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3f281c]"
              >
                Open Planner
              </a>
            </div>

            {upcomingBreedingPlans.length > 0 ? (
              <div className="space-y-4">
                {upcomingBreedingPlans.map((plan) => (
                  <article
                    key={plan.id}
                    className="rounded-2xl border border-[#E5D6C4] bg-white p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#5B3A29] px-3 py-1 text-xs font-semibold text-white">
                        {plan.status || "Planned"}
                      </span>

                      <span className="text-sm text-[#7A6A5A]">
                        Expected: {formatDate(plan.expected_birth_date)}
                      </span>
                    </div>

                    <h3 className="font-bold">
                      {plan.planned_foal_name || "Unnamed planned foal"}
                    </h3>

                    <p className="mt-2 text-sm text-[#4A3A2D]">
                      <span className="font-semibold">Sire:</span>{" "}
                      {getPlanHorseName(plan.sire, plan.sire_name)}
                    </p>

                    <p className="mt-1 text-sm text-[#4A3A2D]">
                      <span className="font-semibold">Dam:</span>{" "}
                      {getPlanHorseName(plan.dam, plan.dam_name)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-8 text-center text-sm text-[#7A6A5A]">
                No breeding plans yet.
              </div>
            )}
          </section>
        </section>

        <section className="mt-8 rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Recent Horses</h2>
              <p className="mt-2 text-[#7A6A5A]">
                The latest horse records added to Ostford Ranch.
              </p>
            </div>

            <a
              href="/horses/new"
              className="rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c]"
            >
              Add Horse
            </a>
          </div>

          {recentHorses.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {recentHorses.map((horse) => (
                <article
                  key={horse.id}
                  className="overflow-hidden rounded-3xl border border-[#E5D6C4] bg-white"
                >
                  {horse.image_url ? (
                    <img
                      src={horse.image_url}
                      alt={horse.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[#D9C7B2] text-sm font-medium text-[#7A6A5A]">
                      No Image
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-xl font-bold">{horse.name}</h3>

                    {horse.barn_name && (
                      <p className="mt-1 text-sm text-[#7A6A5A]">
                        &quot;{horse.barn_name}&quot;
                      </p>
                    )}

                    <p className="mt-3 text-sm text-[#4A3A2D]">
                      {horse.gender || "Unknown"} · {horse.age || "Age unknown"}
                    </p>

                    <p className="mt-1 text-sm text-[#4A3A2D]">
                      {horse.breed || "Unknown breed"} ·{" "}
                      {horse.coat_color || "Unknown color"}
                    </p>

                    <a
                      href={`/horses/${horse.id}`}
                      className="mt-5 inline-block rounded-full bg-[#5B3A29] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3f281c]"
                    >
                      View Profile
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#D9C7B2] p-10 text-center text-[#7A6A5A]">
              No horses added yet.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}