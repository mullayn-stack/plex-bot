import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProfile, signOut, updateProfile } from "./actions";

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: tags }, params] = await Promise.all([
    supabase.from("emergency_profiles").select("*").eq("owner_id", user.id).maybeSingle(),
    supabase.from("nfc_tags").select("code,status,activated_at").eq("owner_id", user.id),
    searchParams,
  ]);

  return (
    <main className="shell account-shell">
      <header className="account-header">
        <div><p className="eyebrow">Nate&apos;s Krafts · Emergency NFC</p><h1>My emergency profile</h1><p className="muted">Signed in as {user.email}</p></div>
        <form action={signOut}><button className="button button-secondary" type="submit">Sign out</button></form>
      </header>

      {params.saved === "1" && <div className="notice success">Your emergency information has been updated. Your NFC tag does not need to be rewritten.</div>}

      <section className="card">
        <h2>Your NFC tag{tags && tags.length !== 1 ? "s" : ""}</h2>
        {tags?.length ? tags.map((tag) => (
          <div className="tag-row" key={tag.code}><div><code>{tag.code}</code><span className={`status status-${tag.status}`}>{tag.status}</span></div><Link className="text-link" href={`/e/${tag.code}`}>View emergency screen</Link></div>
        )) : <p>No active tag is linked to this account yet. Tap your unactivated NFC tag to begin setup.</p>}
      </section>

      {profile ? (
        <section className="card">
          <div className="section-heading"><div><h2>Edit information</h2><p>Changes appear on your tag immediately after saving.</p></div></div>
          <form action={updateProfile} className="form-stack edit-form">
            <h3>Emergency-visible information</h3>
            <label>Full name<input name="full_name" required defaultValue={profile.full_name || ""} maxLength={120} /></label>
            <label>Medical conditions<textarea name="medical_conditions" rows={3} defaultValue={profile.medical_conditions || ""} maxLength={3000} /></label>
            <label>Allergies<textarea name="allergies" rows={3} defaultValue={profile.allergies || ""} maxLength={3000} /></label>
            <label>Medications<textarea name="medications" rows={3} defaultValue={profile.medications || ""} maxLength={3000} /></label>
            <label>Important medical notes<textarea name="important_medical_notes" rows={4} defaultValue={profile.important_medical_notes || ""} maxLength={3000} /></label>
            <label>Primary contact name<input name="primary_contact_name" required defaultValue={profile.primary_contact_name || ""} maxLength={120} /></label>
            <label>Relationship<input name="primary_contact_relationship" defaultValue={profile.primary_contact_relationship || ""} maxLength={80} /></label>
            <label>Primary contact phone<input name="primary_contact_phone" type="tel" required defaultValue={profile.primary_contact_phone || ""} maxLength={25} /></label>
            <label>Secondary contact name<input name="secondary_contact_name" defaultValue={profile.secondary_contact_name || ""} maxLength={120} /></label>
            <label>Relationship<input name="secondary_contact_relationship" defaultValue={profile.secondary_contact_relationship || ""} maxLength={80} /></label>
            <label>Secondary contact phone<input name="secondary_contact_phone" type="tel" defaultValue={profile.secondary_contact_phone || ""} maxLength={25} /></label>

            <h3>Private information</h3>
            <p className="muted">These fields are not returned by the public emergency lookup.</p>
            <label>Date of birth<input name="date_of_birth" type="date" defaultValue={profile.date_of_birth || ""} /></label>
            <label>Blood type<select name="blood_type" defaultValue={profile.blood_type || ""}><option value="">Not provided</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option><option>Unknown</option></select></label>
            <label>Home town/address<textarea name="home_location" rows={2} defaultValue={profile.home_location || ""} maxLength={500} /></label>
            <label>Additional private notes<textarea name="additional_notes" rows={4} defaultValue={profile.additional_notes || ""} maxLength={3000} /></label>
            <button className="button button-primary" type="submit">Save changes</button>
          </form>
        </section>
      ) : (
        <section className="card"><h2>No profile yet</h2><p>Tap an unactivated Nate&apos;s Krafts Emergency NFC tag and follow the setup steps.</p></section>
      )}

      {profile && (
        <section className="card danger-zone"><h2>Delete my profile</h2><p>This permanently removes your saved emergency profile and resets any linked tag so it no longer exposes your information.</p><form action={deleteProfile}><button className="button button-danger-outline" type="submit">Delete profile and unlink tag</button></form></section>
      )}
    </main>
  );
}
