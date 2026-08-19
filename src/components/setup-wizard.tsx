"use client";

import { useState } from "react";

export function SetupWizard({ code, action }: { code: string; action: (formData: FormData) => void | Promise<void> }) {
  const [step, setStep] = useState(1);
  const total = 4;

  function next() {
    const section = document.querySelector(`[data-step="${step}"]`);
    const required = Array.from(section?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]") || []);
    if (required.some((el) => !el.reportValidity())) return;
    setStep((s) => Math.min(total, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form action={action} className="wizard" encType="multipart/form-data">
      <input type="hidden" name="tag_code" value={code} />
      <div className="progress-wrap"><div className="progress-meta"><span>Step {step} of {total}</span><strong>{Math.round((step / total) * 100)}%</strong></div><div className="progress-track"><span style={{ width: `${(step / total) * 100}%` }} /></div></div>

      <fieldset data-step="1" hidden={step !== 1}>
        <legend>About you</legend>
        <p className="step-copy">Start with the basics. Date of birth and photo stay private in this version.</p>
        <label>Full name <span>*</span><input name="full_name" autoComplete="name" required maxLength={120} /></label>
        <label>Date of birth <small>Optional</small><input name="date_of_birth" type="date" autoComplete="bday" /></label>
        <label>Profile photograph <small>Optional, private</small><input name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
        <label>Home town/address <small>Optional, private</small><textarea name="home_location" rows={2} maxLength={500} /></label>
      </fieldset>

      <fieldset data-step="2" hidden={step !== 2}>
        <legend>Medical information</legend>
        <p className="step-copy">These first four medical fields are what a responder can see when they tap the tag.</p>
        <label>Medical conditions<textarea name="medical_conditions" rows={3} maxLength={3000} placeholder="For example: Type 1 diabetes, epilepsy" /></label>
        <label>Allergies<textarea name="allergies" rows={3} maxLength={3000} placeholder="For example: Penicillin, peanuts" /></label>
        <label>Medications<textarea name="medications" rows={3} maxLength={3000} placeholder="Include only medication information useful in an emergency" /></label>
        <label>Important medical notes<textarea name="important_medical_notes" rows={4} maxLength={3000} placeholder="For example: Uses insulin pump; carries adrenaline auto-injector" /></label>
        <label>Blood type <small>Optional, kept private</small><select name="blood_type" defaultValue=""><option value="">Not provided</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option><option>Unknown</option></select></label>
      </fieldset>

      <fieldset data-step="3" hidden={step !== 3}>
        <legend>Emergency contacts</legend>
        <p className="step-copy">These names and phone numbers are shown on the emergency screen as one-tap call buttons.</p>
        <h3>Primary contact</h3>
        <label>Name <span>*</span><input name="primary_contact_name" required maxLength={120} /></label>
        <label>Relationship<input name="primary_contact_relationship" maxLength={80} placeholder="Parent, partner, friend…" /></label>
        <label>Phone number <span>*</span><input name="primary_contact_phone" type="tel" inputMode="tel" required maxLength={25} placeholder="+44 7…" /></label>
        <h3>Secondary contact</h3>
        <label>Name <small>Optional</small><input name="secondary_contact_name" maxLength={120} /></label>
        <label>Relationship <small>Optional</small><input name="secondary_contact_relationship" maxLength={80} /></label>
        <label>Phone number <small>Optional</small><input name="secondary_contact_phone" type="tel" inputMode="tel" maxLength={25} /></label>
      </fieldset>

      <fieldset data-step="4" hidden={step !== 4}>
        <legend>Review and activate</legend>
        <div className="privacy-note"><strong>Public when the tag is tapped:</strong> your name, conditions, allergies, medication information, critical medical notes and emergency contact call details.</div>
        <div className="privacy-note"><strong>Kept private:</strong> your account email, date of birth, photo, blood type, home location and the private notes below.</div>
        <label>Additional private notes <small>Optional</small><textarea name="additional_notes" rows={4} maxLength={3000} /></label>
        <label className="check-row"><input type="checkbox" required /> <span>I understand that the emergency fields above will be visible to anyone who physically taps or scans this tag.</span></label>
        <button className="button button-primary" type="submit">Save profile and activate tag</button>
      </fieldset>

      <div className="wizard-nav">
        {step > 1 && <button className="button button-secondary" type="button" onClick={back}>Back</button>}
        {step < total && <button className="button button-primary" type="button" onClick={next}>Save &amp; continue</button>}
      </div>
    </form>
  );
}
