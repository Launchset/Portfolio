export const connectReviewOrigin = "https://launchset-connect-shadow.jhelyar04.workers.dev";

type ReviewerEnvironment = {
  BETTER_AUTH_URL?: string;
  AUTH_ADMIN_EMAIL?: string;
  CONNECT_REVIEWER_LOGIN_ENABLED?: string;
  CONNECT_REVIEWER_EMAIL?: string;
};

// This sign-in method is only for the approved isolated review deployment.
export function connectReviewerEmail(environment: ReviewerEnvironment, requestOrigin?: string) {
  const email = environment.CONNECT_REVIEWER_EMAIL?.trim().toLowerCase();
  if (environment.CONNECT_REVIEWER_LOGIN_ENABLED !== "true"
    || environment.BETTER_AUTH_URL !== connectReviewOrigin
    || (requestOrigin !== undefined && requestOrigin !== connectReviewOrigin)
    || !email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
    || email === environment.AUTH_ADMIN_EMAIL?.trim().toLowerCase()) return null;
  return email;
}
