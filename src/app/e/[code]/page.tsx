import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { telHref, validTagCode } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function EmergencyTagPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  if (!validTagCode(code)) notFound();

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("public_emergency_profile", { p_code: code });
  if (error) throw new Error("Emergency profile lookup failed.");
  const profile = Array.isArray(data) ? data[0] : null;
  if (!profile) notFound();

  if (profile.tag_status === "unactivated") {
    return (
      <main className="shell">
        <section className="card activation-card">
          <div className="brand-mark">NK</div>
          <p className="eyebrow">Nate&apos;s Krafts · Emergency NFC</p>
          <h1>Activate your emergency tag</h1>
          <p>This tag is ready to link to your emergency profile. You&apos;ll verify your email first, then add the information you want available in an emergency.</p>
          <div className="privacy-note"><strong>Your tag stays the same.</strong> You can update your information later without rewriting the NFC chip.</div>
          <Link className="button button-primary" href={`/login?next=${encodeURIComponent(`/e/${code}/setup`)}`}>Start secure setup</Link>
          <p className="fine-print">Only emergency-relevant information is shown when this tag is tapped. Private account details are kept separate.</p>
        </section>
      </main>
    );
  }

  if (profile.tag_status === "disabled") {
    return (
      <main className="shell emergency-shell">
        <header className="emergency-header"><span className="emergency-icon">!</span><div><p>EMERGENCY INFORMATION</p><h1>Tag unavailable</h1></div></header>
        <section className="card"><p>This NFC tag has been disabled by its owner or issuer. No emergency profile is available from this tag.</p></section>
        <EmergencyServices />
      </main>
    );
  }

  return (
    <main className="shell emergency-shell">
      <header className="emergency-header">
        <span className="emergency-icon">!</span>
        <div><p>EMERGENCY INFORMATION</p><h1>{profile.full_name}</h1></div>
      </header>
      <p className="emergency-intro">If I am unable to communicate, please use the information below.</p>

      <section className="alert-grid" aria-label="Emergency medical information">
        <InfoCard title="Medical conditions" value={profile.medical_conditions} alert />
        <InfoCard title="Allergies" value={profile.allergies} alert />
        <InfoCard title="Important medication information" value={profile.medications} />
        <InfoCard title="Other critical notes" value={profile.important_medical_notes} />
      </section>

      <section className="call-section" aria-label="Emergency contacts">
        <h2>Emergency contacts</h2>
        <a className="button call-button" href={telHref(profile.primary_contact_phone)}>
          <span>CALL PRIMARY EMERGENCY CONTACT</span>
          <small>{profile.primary_contact_name}{profile.primary_contact_relationship ? ` · ${profile.primary_contact_relationship}` : ""}</small>
        </a>
        {profile.secondary_contact_phone && profile.secondary_contact_name && (
          <a className="button call-button" href={telHref(profile.secondary_contact_phone)}>
            <span>CALL SECOND EMERGENCY CONTACT</span>
            <small>{profile.secondary_contact_name}{profile.secondary_contact_relationship ? ` · ${profile.secondary_contact_relationship}` : ""}</small>
          </a>
        )}
      </section>

      <EmergencyServices />
      <footer className="emergency-footer">Nate&apos;s Krafts · Emergency NFC<br /><span>This information is supplied by the tag owner and is not medically verified.</span></footer>
    </main>
  );
}

function InfoCard({ title, value, alert = false }: { title: string; value?: string | null; alert?: boolean }) {
  return (
    <article className={`info-card ${alert ? "critical-card" : ""}`}>
      <h2>{title}</h2>
      <p>{value || "None stated"}</p>
    </article>
  );
}

function EmergencyServices() {
  return (
    <section className="service-section" aria-label="Emergency services">
      <h2>Emergency services</h2>
      <div className="service-grid">
        <a className="button emergency-button" href="tel:999">CALL 999</a>
        <a className="button emergency-button" href="tel:112">CALL 112</a>
      </div>
    </section>
  );
}
