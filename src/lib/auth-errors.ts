type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const SAME_BROWSER_MESSAGE =
  "Open the newest account link in the same browser and device where you requested it.";

function isRateLimited(error: AuthErrorLike): boolean {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return error.status === 429 || details.includes("rate limit") || details.includes("rate_limit");
}

export function getPasswordSignInErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (isRateLimited(error)) {
    return "Too many login attempts were made. Wait a few minutes and try again.";
  }
  if (details.includes("email not confirmed")) {
    return "Confirm your email before logging in. Open the newest message from Rhythm.";
  }
  if (details.includes("invalid login credentials") || details.includes("invalid_credentials")) {
    return "The email or password is incorrect. Create an account first or reset your password.";
  }
  return "We could not log in to this account. Please wait a minute and try again.";
}

export function getPasswordSignUpErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (isRateLimited(error)) {
    return "Too many account requests were made. Wait a few minutes and try again.";
  }
  if (details.includes("password") && details.includes("weak")) {
    return "Choose a stronger password with at least 8 characters.";
  }
  if (details.includes("signup") && details.includes("disabled")) {
    return "New account registration is currently disabled in Supabase.";
  }
  return "We could not create the account. Check the details and try again.";
}

export function getPasswordRecoveryErrorMessage(error: AuthErrorLike): string {
  if (isRateLimited(error)) {
    return "Too many reset requests were made. Wait a few minutes and try again.";
  }
  return "We could not send a password reset email. Please wait a minute and try again.";
}

export function getPasswordUpdateErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (details.includes("same password")) {
    return "Choose a password you have not used for this account.";
  }
  return "We could not update the password. Request a new reset link and try again.";
}

export function getAuthCallbackErrorMessage(error: AuthErrorLike): string {
  const details = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  if (details.includes("code verifier") || details.includes("bad_code_verifier")) {
    return SAME_BROWSER_MESSAGE;
  }
  if (details.includes("expired") || details.includes("otp_expired")) {
    return "That account link has expired. Request a new one.";
  }
  return "That account link could not be verified. Request a new one.";
}
