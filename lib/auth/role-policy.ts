export type ProfileRole = "student" | "teacher" | "admin"
export type RegistrationRole = Extract<ProfileRole, "student" | "teacher">

type ResolveProfileRoleInput = {
  currentRole?: ProfileRole
  registrationRole?: RegistrationRole
}

/**
 * A role can only be selected while creating a profile. Existing roles are
 * authoritative and cannot be changed by login or bootstrap request data.
 */
export const resolveProfileRole = ({
  currentRole,
  registrationRole,
}: ResolveProfileRoleInput): ProfileRole =>
  currentRole ?? registrationRole ?? "student"
