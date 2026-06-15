import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await supabase.from("breeding_plans").delete().eq("id", id);

  redirect("/breeding-planner");
}