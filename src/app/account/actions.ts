"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cleanText, phone, requiredText } from "@/lib/validation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/login?next=/account");

  const payload = {
    full_name: requiredText(formData.get("full_name"), "Full name"),
    date_of_birth: cleanText(formData.get("date_of_birth"), 10),
    medical_conditions: cleanText(formData.get("medical_conditions"), 3000),
    allergies: cleanText(formData.get("allergies"), 3000),
    medications: cleanText(formData.get("medications"), 3000),
    blood_type: cleanText(formData.get("blood_type"), 10),
    important_medical_notes: cleanText(formData.get("important_medical_notes"), 3000),
    primary_contact_name: requiredText(formData.get("primary_contact_name"), "Primary emergency contact"),
    primary_contact_relationship: cleanText(formData.get("primary_contact_relationship"), 80),
    primary_contact_phone: phone(formData.get("primary_contact_phone"), true),
    secondary_contact_name: cleanText(formData.get("secondary_contact_name"), 120),
    secondary_contact_relationship: cleanText(formData.get("secondary_contact_relationship"), 80),
    secondary_contact_phone: phone(formData.get("secondary_contact_phone")),
    home_location: cleanText(formData.get("home_location"), 500),
    additional_notes: cleanText(formData.get("additional_notes"), 3000),
  };

  const { error } = await supabase.from("emergency_profiles").update(payload).eq("owner_id", user.id);
  if (error) throw new Error("Could not update your emergency profile.");
  redirect("/account?saved=1");
}

export async function deleteProfile() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/account");
  const { error } = await supabase.rpc("delete_my_profile");
  if (error) throw new Error("Could not delete your profile.");
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
