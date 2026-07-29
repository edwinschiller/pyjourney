import assert from "node:assert/strict"
import test from "node:test"

import { resolveProfileRole } from "../lib/auth/role-policy"

test("keeps an existing student role when teacher is requested", () => {
  assert.equal(
    resolveProfileRole({
      currentRole: "student",
      registrationRole: "teacher",
    }),
    "student"
  )
})

test("keeps an existing teacher role when student is requested", () => {
  assert.equal(
    resolveProfileRole({
      currentRole: "teacher",
      registrationRole: "student",
    }),
    "teacher"
  )
})

test("preserves admin roles", () => {
  assert.equal(
    resolveProfileRole({
      currentRole: "admin",
      registrationRole: "teacher",
    }),
    "admin"
  )
})

test("uses the selected role for a new profile", () => {
  assert.equal(resolveProfileRole({ registrationRole: "teacher" }), "teacher")
})

test("defaults a new profile to student", () => {
  assert.equal(resolveProfileRole({}), "student")
})
