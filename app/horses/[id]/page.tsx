import { supabase } from "@/lib/supabase";
import DeleteHorseButton from "@/components/horses/DeleteHorseButton";
import AppHeader from "@/components/layout/AppHeader";

type PedigreeHorse = {
  id: string;
  name: string;
  barn_name: string | null;
};

type OffspringHorse = {
  id: string;
  name: string;
  barn_name: string | null;
  gender: string | null;
  age: string | null;
  breed: string | null;
};

type HorseProfile = {
  id: string;
  name: string;
  barn_name: string | null;
  gender: string | null;
  age: string | null;
  breed: string | null;
  coat_color: string | null;
  height: string | null;
  discipline: string | null;
  status: string | null;
  owner: string | null;
  breeder: string | null;
  sire_id: string | null;
  dam_id: string | null;
  sire_name: string | null;
  dam_name: string | null;
  personality: string | null;
  background_story: string | null;
  notes: string | null;
  image_url: string | null;
};

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7A6A5A]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#2B2118]">
        {value || "—"}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function HorseProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: horse, error } = await supabase
    .from("horses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !horse) {
    return (
      <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
        <section className="mx-auto max-w-6xl">
          <AppHeader />

          <div className="rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
            <h1 className="text-3xl font-bold">Horse not found</h1>
            <p className="mt-3 text-[#7A6A5A]">
              This horse record could not be loaded.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const typedHorse = horse as HorseProfile;

  let sire: PedigreeHorse | null = null;
  let dam: PedigreeHorse | null = null;

  if (typedHorse.sire_id) {
    const { data } = await supabase
      .from("horses")
      .select("id, name, barn_name")
      .eq("id", typedHorse.sire_id)
      .single();

    sire = data;
  }

  if (typedHorse.dam_id) {
    const { data } = await supabase
      .from("horses")
      .select("id, name, barn_name")
      .eq("id", typedHorse.dam_id)
      .single();

    dam = data;
  }

  const { data: offspringData } = await supabase
    .from("horses")
    .select("id, name, barn_name, gender, age, breed")
    .or(`sire_id.eq.${typedHorse.id},dam_id.eq.${typedHorse.id}`)
    .order("name", { ascending: true });

  const offspring = (offspringData || []) as OffspringHorse[];

  return (
    <main className="min-h-screen bg-[#F6EFE5] px-6 py-8 text-[#2B2118]">
      <section className="mx-auto max-w-6xl">
        <AppHeader />

        <section className="overflow-hidden rounded-[2rem] bg-[#FFFAF2] shadow-sm">
          <div className="relative">
            {typedHorse.image_url ? (
              <img
                src={typedHorse.image_url}
                alt={typedHorse.name}
                className="h-[28rem] w-full object-cover"
              />
            ) : (
              <div className="flex h-[28rem] items-center justify-center bg-[#D9C7B2] text-[#7A6A5A]">
                No Image
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-8 text-white">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="mb-3 inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">
                    {typedHorse.status || "Active"}
                  </p>

                  <h1 className="text-5xl font-bold">{typedHorse.name}</h1>

                  {typedHorse.barn_name && (
                    <p className="mt-2 text-2xl text-white/85">
                      &quot;{typedHorse.barn_name}&quot;
                    </p>
                  )}

                  <p className="mt-4 text-white/85">
                    {typedHorse.gender || "Unknown"} ·{" "}
                    {typedHorse.age || "Age unknown"} ·{" "}
                    {typedHorse.breed || "Unknown breed"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`/horses/${typedHorse.id}/edit`}
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#5B3A29] hover:bg-[#F6EFE5]"
                  >
                    Edit Horse
                  </a>

                  <DeleteHorseButton horseId={typedHorse.id} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Basic Information">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="Name" value={typedHorse.name} />
              <InfoRow label="Barn Name" value={typedHorse.barn_name} />
              <InfoRow label="Gender" value={typedHorse.gender} />
              <InfoRow label="Age" value={typedHorse.age} />
              <InfoRow label="Breed" value={typedHorse.breed} />
              <InfoRow label="Coat Color" value={typedHorse.coat_color} />
              <InfoRow label="Height" value={typedHorse.height} />
              <InfoRow label="Discipline" value={typedHorse.discipline} />
            </div>
          </SectionCard>

          <SectionCard title="Ownership">
            <div className="space-y-3">
              <InfoRow label="Owner" value={typedHorse.owner || "Ostford Ranch"} />
              <InfoRow label="Breeder" value={typedHorse.breeder} />
              <InfoRow label="Status" value={typedHorse.status || "Active"} />
            </div>
          </SectionCard>

          <SectionCard title="Pedigree">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7A6A5A]">
                  Sire
                </p>

                <p className="mt-2 text-sm font-medium">
                  {sire ? (
                    <a
                      href={`/horses/${sire.id}`}
                      className="text-[#5B3A29] underline underline-offset-4 hover:text-[#3f281c]"
                    >
                      {sire.name}
                      {sire.barn_name ? ` "${sire.barn_name}"` : ""}
                    </a>
                  ) : typedHorse.sire_name ? (
                    typedHorse.sire_name
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7A6A5A]">
                  Dam
                </p>

                <p className="mt-2 text-sm font-medium">
                  {dam ? (
                    <a
                      href={`/horses/${dam.id}`}
                      className="text-[#5B3A29] underline underline-offset-4 hover:text-[#3f281c]"
                    >
                      {dam.name}
                      {dam.barn_name ? ` "${dam.barn_name}"` : ""}
                    </a>
                  ) : typedHorse.dam_name ? (
                    typedHorse.dam_name
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Offspring">
            {offspring.length > 0 ? (
              <div className="grid gap-3">
                {offspring.map((foal) => (
                  <a
                    key={foal.id}
                    href={`/horses/${foal.id}`}
                    className="rounded-2xl bg-white p-4 hover:bg-[#F6EFE5]"
                  >
                    <p className="font-semibold text-[#5B3A29]">{foal.name}</p>

                    {foal.barn_name && (
                      <p className="mt-1 text-sm text-[#7A6A5A]">
                        &quot;{foal.barn_name}&quot;
                      </p>
                    )}

                    <p className="mt-2 text-sm text-[#4A3A2D]">
                      {foal.gender || "Unknown"} ·{" "}
                      {foal.age || "Age unknown"} ·{" "}
                      {foal.breed || "Unknown breed"}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#7A6A5A]">
                No offspring recorded yet.
              </p>
            )}
          </SectionCard>

          <section className="space-y-6 lg:col-span-2">
            <SectionCard title="Personality">
              <p className="whitespace-pre-line text-sm leading-7 text-[#4A3A2D]">
                {typedHorse.personality ||
                  "No personality description added yet."}
              </p>
            </SectionCard>

            <SectionCard title="Background Story">
              <p className="whitespace-pre-line text-sm leading-7 text-[#4A3A2D]">
                {typedHorse.background_story ||
                  "No background story added yet."}
              </p>
            </SectionCard>

            <SectionCard title="Notes">
              <p className="whitespace-pre-line text-sm leading-7 text-[#4A3A2D]">
                {typedHorse.notes || "No notes added yet."}
              </p>
            </SectionCard>
          </section>
        </section>
      </section>
    </main>
  );
}