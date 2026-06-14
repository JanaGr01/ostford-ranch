import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";

export default async function Home() {
  const { data: horses, error } = await supabase
    .from("horses")
    .select("id, name, barn_name, gender, age, breed, coat_color, discipline, status, image_url, created_at")
    .order("created_at", { ascending: false });

  const totalHorses = horses?.length || 0;
  const activeHorses = horses?.filter((horse) => horse.status === "Active").length || 0;
  const mares = horses?.filter((horse) => horse.gender === "Mare").length || 0;
  const stallions = horses?.filter((horse) => horse.gender === "Stallion").length || 0;

  const recentHorses = horses?.slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-[#F6EFE5] text-[#2B2118]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <AppHeader />

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-[#FFFAF2] p-5 shadow-sm">
            <p className="text-sm text-[#7A6A5A]">Total Horses</p>
            <p className="mt-2 text-3xl font-bold">{totalHorses}</p>
          </div>

          <div className="rounded-2xl bg-[#FFFAF2] p-5 shadow-sm">
            <p className="text-sm text-[#7A6A5A]">Active Horses</p>
            <p className="mt-2 text-3xl font-bold">{activeHorses}</p>
          </div>

          <div className="rounded-2xl bg-[#FFFAF2] p-5 shadow-sm">
            <p className="text-sm text-[#7A6A5A]">Mares</p>
            <p className="mt-2 text-3xl font-bold">{mares}</p>
          </div>

          <div className="rounded-2xl bg-[#FFFAF2] p-5 shadow-sm">
            <p className="text-sm text-[#7A6A5A]">Stallions</p>
            <p className="mt-2 text-3xl font-bold">{stallions}</p>
          </div>
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