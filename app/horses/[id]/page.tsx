import { supabase } from "@/lib/supabase";
import AppHeader from "@/components/layout/AppHeader";
import DeleteHorseButton from "@/components/horses/DeleteHorseButton";
import HorseGallery from "@/components/horses/HorseGallery";
import HorseTimeline from "@/components/horses/HorseTimeline";
import HorseShowResults from "@/components/horses/HorseShowResults";
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
  breed: string | null;
  image_url: string | null;
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
  created_at: string | null;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
        {label}
      </p>
      <p className="mt-1 text-[#2B2118]">{value || "Not set"}</p>
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
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
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
    .select(
      "id, name, barn_name, gender, age, breed, coat_color, height, discipline, status, owner, breeder, sire_id, dam_id, sire_name, dam_name, personality, background_story, notes, image_url, created_at"
    )
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
              This horse profile could not be loaded.
            </p>

            <a
              href="/horses"
              className="mt-6 inline-block rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c]"
            >
              Back to Horses
            </a>
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

    sire = data as PedigreeHorse | null;
  }

  if (typedHorse.dam_id) {
    const { data } = await supabase
      .from("horses")
      .select("id, name, barn_name")
      .eq("id", typedHorse.dam_id)
      .single();

    dam = data as PedigreeHorse | null;
  }

  const { data: offspringData } = await supabase
    .from("horses")
    .select("id, name, barn_name, gender, breed, image_url")
    .or(`sire_id.eq.${typedHorse.id},dam_id.eq.${typedHorse.id}`)
    .order("created_at", { ascending: false });

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
              <div className="flex h-[28rem] w-full items-center justify-center bg-[#D9C7B2] text-lg font-medium text-[#7A6A5A]">
                No Image
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#5B3A29]">
                  {typedHorse.status || "Active"}
                </span>

                {typedHorse.discipline && (
                  <span className="rounded-full bg-black/30 px-4 py-2 text-sm font-semibold backdrop-blur">
                    {typedHorse.discipline}
                  </span>
                )}
              </div>

              <h1 className="text-5xl font-bold">{typedHorse.name}</h1>

              {typedHorse.barn_name && (
                <p className="mt-3 text-xl text-white/85">
                  &quot;{typedHorse.barn_name}&quot;
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
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
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Basic Information">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="Gender" value={typedHorse.gender} />
              <InfoRow label="Age" value={typedHorse.age} />
              <InfoRow label="Breed" value={typedHorse.breed} />
              <InfoRow label="Coat Color" value={typedHorse.coat_color} />
              <InfoRow label="Height" value={typedHorse.height} />
              <InfoRow label="Discipline" value={typedHorse.discipline} />
            </div>
          </SectionCard>

          <SectionCard title="Ownership">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="Owner" value={typedHorse.owner} />
              <InfoRow label="Breeder" value={typedHorse.breeder} />
            </div>
          </SectionCard>

          <SectionCard title="Pedigree">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                  Sire
                </p>

                {sire ? (
                  <a
                    href={`/horses/${sire.id}`}
                    className="mt-2 block text-lg font-semibold text-[#5B3A29] hover:underline"
                  >
                    {sire.name}
                    {sire.barn_name ? ` "${sire.barn_name}"` : ""}
                  </a>
                ) : typedHorse.sire_name ? (
                  <p className="mt-2 text-lg font-semibold">
                    {typedHorse.sire_name}
                  </p>
                ) : (
                  <p className="mt-2 text-[#7A6A5A]">Not set</p>
                )}
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9A8B7A]">
                  Dam
                </p>

                {dam ? (
                  <a
                    href={`/horses/${dam.id}`}
                    className="mt-2 block text-lg font-semibold text-[#5B3A29] hover:underline"
                  >
                    {dam.name}
                    {dam.barn_name ? ` "${dam.barn_name}"` : ""}
                  </a>
                ) : typedHorse.dam_name ? (
                  <p className="mt-2 text-lg font-semibold">
                    {typedHorse.dam_name}
                  </p>
                ) : (
                  <p className="mt-2 text-[#7A6A5A]">Not set</p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Offspring">
            {offspring.length > 0 ? (
              <div className="grid gap-4">
                {offspring.map((foal) => (
                  <a
                    key={foal.id}
                    href={`/horses/${foal.id}`}
                    className="flex gap-4 rounded-2xl bg-white p-4 hover:bg-[#F6EFE5]"
                  >
                    {foal.image_url ? (
                      <img
                        src={foal.image_url}
                        alt={foal.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D9C7B2] text-xs text-[#7A6A5A]">
                        No Image
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-[#5B3A29]">
                        {foal.name}
                      </h3>

                      {foal.barn_name && (
                        <p className="text-sm text-[#7A6A5A]">
                          &quot;{foal.barn_name}&quot;
                        </p>
                      )}

                      <p className="mt-1 text-sm text-[#4A3A2D]">
                        {foal.gender || "Unknown"} ·{" "}
                        {foal.breed || "Unknown breed"}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[#7A6A5A]">No offspring recorded yet.</p>
            )}
          </SectionCard>

          <SectionCard title="Personality">
            <p className="whitespace-pre-line leading-relaxed text-[#4A3A2D]">
              {typedHorse.personality || "No personality notes yet."}
            </p>
          </SectionCard>

          <SectionCard title="Background Story">
            <p className="whitespace-pre-line leading-relaxed text-[#4A3A2D]">
              {typedHorse.background_story || "No background story yet."}
            </p>
          </SectionCard>

          <section className="lg:col-span-2">
            <SectionCard title="Notes">
              <p className="whitespace-pre-line leading-relaxed text-[#4A3A2D]">
                {typedHorse.notes || "No notes yet."}
              </p>
            </SectionCard>
          </section>
        </section>

        <div className="mt-8">
         <HorseTimeline horseId={typedHorse.id} />
        </div>

        <div className="mt-8">
          <HorseShowResults horseId={typedHorse.id} />
        </div>
        
        <div className="mt-8">
          <HorseGallery horseId={typedHorse.id} />
        </div>
      </section>
    </main>
  );
}