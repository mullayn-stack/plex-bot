"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Authentication required.");
  const { data: admin } = await supabase.rpc("is_admin");
  if (!admin) throw new Error("Admin access required.");
  return supabase;
}

export async function createTags(formData: FormData) {
  const count = Math.max(1, Math.min(100, Number(formData.get("count") || 1)));
  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("admin_create_tags", { p_count: count });
  if (error) throw new Error("Could not create tags.");
  revalidatePath("/admin");
}

export async function changeTagState(formData: FormData) {
  const code = String(formData.get("code") || "").toUpperCase();
  const action = String(formData.get("action") || "");
  if (!new Set(["disable", "reactivate", "reset"]).has(action)) throw new Error("Invalid tag action.");
  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("admin_set_tag_state", { p_code: code, p_action: action });
  if (error) throw new Error("Could not update tag state.");
  revalidatePath("/admin");
}
