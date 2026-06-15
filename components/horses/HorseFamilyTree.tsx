type FamilyHorse = {
  id: string;
  name: string;
  barn_name: string | null;
  gender?: string | null;
  breed?: string | null;
  image_url?: string | null;
};

type HorseFamilyTreeProps = {
  currentHorse: FamilyHorse;
  sire: FamilyHorse | null;
  dam: FamilyHorse | null;
  sireName: string | null;
  damName: string | null;
  offspring: FamilyHorse[];
};

function HorseCard({
  horse,
  fallbackName,
  label,
  isCurrent = false,
}: {
  horse: FamilyHorse | null;
  fallbackName?: string | null;
  label: string;
  isCurrent?: boolean;
}) {
  const cardClasses = isCurrent
    ? "border-[#5B3A29] bg-[#5B3A29] text-white"
    : "border-[#E5D6C4] bg-white text-[#2B2118]";

  const labelClasses = isCurrent ? "text-white/70" : "text-[#9A8B7A]";
  const detailClasses = isCurrent ? "text-white/80" : "text-[#7A6A5A]";

  if (!horse && !fallbackName) {
    return (
      <div
        className={`rounded-3xl border border-dashed border-[#D9C7B2] p-5 text-center ${cardClasses}`}
      >
        <p className={`text-xs font-semibold uppercase tracking-wide ${labelClasses}`}>
          {label}
        </p>
        <p className="mt-3 font-semibold">Not set</p>
      </div>
    );
  }

  const content = (
    <div className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${cardClasses}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${labelClasses}`}>
        {label}
      </p>

      {horse?.image_url ? (
        <img
          src={horse.image_url}
          alt={horse.name}
          className="mx-auto mt-4 h-28 w-28 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-[#D9C7B2] text-xs text-[#7A6A5A]">
          No Image
        </div>
      )}

      <h3 className="mt-4 text-center text-lg font-bold">
        {horse?.name || fallbackName}
      </h3>

      {horse?.barn_name && (
        <p className={`mt-1 text-center text-sm ${detailClasses}`}>
          &quot;{horse.barn_name}&quot;
        </p>
      )}

      {(horse?.gender || horse?.breed) && (
        <p className={`mt-2 text-center text-sm ${detailClasses}`}>
          {horse.gender || "Unknown"} · {horse.breed || "Unknown breed"}
        </p>
      )}
    </div>
  );

  if (horse?.id && !isCurrent) {
    return <a href={`/horses/${horse.id}`}>{content}</a>;
  }

  return content;
}

export default function HorseFamilyTree({
  currentHorse,
  sire,
  dam,
  sireName,
  damName,
  offspring,
}: HorseFamilyTreeProps) {
  return (
    <section className="rounded-3xl bg-[#FFFAF2] p-6 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Family Tree</h2>
        <p className="mt-2 text-sm text-[#7A6A5A]">
          A visual overview of this horse&apos;s parents and offspring.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <HorseCard horse={sire} fallbackName={sireName} label="Sire" />
        <HorseCard horse={dam} fallbackName={damName} label="Dam" />
      </div>

      <div className="mx-auto my-6 h-10 w-px bg-[#D9C7B2]" />

      <div className="mx-auto max-w-sm">
        <HorseCard horse={currentHorse} label="Current Horse" isCurrent />
      </div>

      <div className="mx-auto my-6 h-10 w-px bg-[#D9C7B2]" />

      <div>
        <h3 className="mb-4 text-center text-lg font-semibold">Offspring</h3>

        {offspring.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {offspring.map((foal) => (
              <HorseCard key={foal.id} horse={foal} label="Offspring" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D9C7B2] p-8 text-center text-sm text-[#7A6A5A]">
            No offspring recorded yet.
          </div>
        )}
      </div>
    </section>
  );
}