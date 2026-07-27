export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getOwnerEmail(): string | null {
  const email = process.env.RHYTHM_OWNER_EMAIL;
  if (!email?.trim()) return null;
  return normalizeEmail(email);
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const ownerEmail = getOwnerEmail();
  return Boolean(ownerEmail && email && normalizeEmail(email) === ownerEmail);
}
