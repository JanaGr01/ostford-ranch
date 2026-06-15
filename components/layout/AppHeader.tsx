import AuthButton from "@/components/auth/AuthButton";

export default function AppHeader() {
  return (
    <header className="mb-10 flex flex-col justify-between gap-4 border-b border-[#D9C7B2] pb-6 md:flex-row md:items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Ostford Ranch</h1>
      </div>

      <nav className="flex flex-wrap gap-3 text-sm font-medium">
        <a
          href="/"
          className="rounded-full bg-[#5B3A29] px-4 py-2 text-white hover:bg-[#3f281c]"
        >
          Dashboard
        </a>

        <a
          href="/horses"
          className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
        >
          Horses
        </a>

        <a
          href="/horses/new"
          className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
        >
          Add Horse
        </a>

        <a
          href="/breeding-planner"
          className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
        >
          Breeding Planner
        </a>

        <AuthButton />
      </nav>
    </header>
  );
}