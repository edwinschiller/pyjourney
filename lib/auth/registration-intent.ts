import type { RegistrationRole } from "@/lib/auth/role-policy"

const STORAGE_KEY = "pyjourney.registrationRole"

const isRegistrationRole = (value: string | null): value is RegistrationRole =>
  value === "student" || value === "teacher"

/** Persist role choice across remounts / email-verify step. Browser only. */
export const saveRegistrationRole = (role: RegistrationRole) => {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, role)
  } catch {
    // private mode / blocked storage — bootstrap still gets React state
  }
}

export const readRegistrationRole = (): RegistrationRole | null => {
  if (typeof window === "undefined") return null
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY)
    return isRegistrationRole(value) ? value : null
  } catch {
    return null
  }
}

export const clearRegistrationRole = () => {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
