export function cleanText(value: FormDataEntryValue | null, max = 2000) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\u0000/g, "").trim().slice(0, max);
  return cleaned || null;
}

export function requiredText(value: FormDataEntryValue | null, name: string, max = 120) {
  const cleaned = cleanText(value, max);
  if (!cleaned) throw new Error(`${name} is required.`);
  return cleaned;
}

export function phone(value: FormDataEntryValue | null, required = false) {
  const cleaned = cleanText(value, 25);
  if (!cleaned && !required) return null;
  if (!cleaned) throw new Error("Phone number is required.");
  if (!/^\+?[0-9 ()-]{7,25}$/.test(cleaned)) throw new Error("Enter a valid phone number.");
  return cleaned;
}

export function telHref(value: string) {
  const plus = value.trim().startsWith("+") ? "+" : "";
  return `tel:${plus}${value.replace(/\D/g, "")}`;
}

export function validTagCode(code: string) {
  return /^[A-F0-9]{12}$/.test(code.toUpperCase());
}
