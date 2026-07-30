type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const SAME_BROWSER_MESSAGE =
  "Open the newest sign-in link in the same browser and device where you requested it.";

export function getOtpRequestErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (
    error.status === 429 ||
    details.includes("rate limit") ||
    details.includes("rate_limit")
  ) {
    return "Supabase has reached its temporary email limit. Wait up to one hour, then request one new code.";
  }

  if (details.includes("email address not authorized")) {
    return "This email is not authorized by the current Supabase mail setup.";
  }

  return "We could not send a sign-in code. Please wait a minute and try once more.";
}

export function getOtpVerificationErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (details.includes("expired") || details.includes("otp_expired")) {
    return "That sign-in code has expired. Request one new code.";
  }

  if (
    details.includes("invalid") ||
    details.includes("token") ||
    details.includes("otp")
  ) {
    return "That code is incorrect or has expired. Check the newest email and try again.";
  }

  return "We could not verify that code. Please request a new one and try again.";
}

export function getPasswordSignInErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (
    error.status === 429 ||
    details.includes("rate limit") ||
    details.includes("rate_limit")
  ) {
    return "Too many sign-in attempts were made. Wait a few minutes and try again.";
  }

  if (details.includes("email not confirmed")) {
    return "This account is not confirmed yet. Confirm it from Supabase Users before signing in.";
  }

  if (
    details.includes("invalid login credentials") ||
    details.includes("invalid_credentials")
  ) {
    return "The email or password is incorrect.";
  }

  return "We could not sign in to this account. Please wait a minute and try again.";
}

export function getAuthCallbackErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (
    details.includes("code verifier") ||
    details.includes("bad_code_verifier")
  ) {
    return SAME_BROWSER_MESSAGE;
  }

  if (details.includes("expired") || details.includes("otp_expired")) {
    return "That sign-in link has expired. Return here and request one new link.";
  }

  return "That sign-in link could not be verified. Return here and request one new link.";
}
