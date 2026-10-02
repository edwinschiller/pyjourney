export type ProfileRole = "student" | "teacher" | "admin"
export type RegistrationRole = Extract<ProfileRole, "student" | "teacher">

type ResolveProfileRoleInput = {
  currentRole?: ProfileRole
  registrationRole?: RegistrationRole
}

/**
 * Role for a brand-new profile row (no prior profile for this auth id / email).
 */
export const resolveProfileRole = ({
  currentRole,
  registrationRole,
}: ResolveProfileRoleInput): ProfileRole =>
  currentRole ?? registrationRole ?? "student"

/**
 * Neon Auth issued a new user id for an email that still has an app profile
 * (typical after deleting the auth user and registering again).
 *
 * Honor the registration choice. Login cannot reach this path for a live
 * account with the same auth id — that hits ensureProfile-by-id and never
 * changes role. Admin is never overwritten here.
 */
export const resolveReclaimedProfileRole = ({
  currentRole,
  registrationRole,
}: ResolveProfileRoleInput): ProfileRole => {
  if (currentRole === "admin") return "admin"
  return registrationRole ?? currentRole ?? "student"
}
