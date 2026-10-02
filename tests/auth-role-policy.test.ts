import assert from "node:assert/strict"
import test from "node:test"

import {
  resolveProfileRole,
  resolveReclaimedProfileRole,
} from "../lib/auth/role-policy"

test("existing profile lookup keeps student (login cannot escalate)", () => {
  assert.equal(
    resolveProfileRole({
      currentRole: "student",
      registrationRole: "teacher",
    }),
    "student"
  )
})

test("existing profile lookup keeps teacher", () => {
  assert.equal(
    resolveProfileRole({
      currentRole: "teacher",
      registrationRole: "student",
    }),
    "teacher"
  )
})

test("preserves admin roles on normal resolve", () => {
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

test("reclaim after auth delete applies teacher registration", () => {
  assert.equal(
    resolveReclaimedProfileRole({
      currentRole: "student",
      registrationRole: "teacher",
    }),
    "teacher"
  )
})

test("reclaim after auth delete applies student registration", () => {
  assert.equal(
    resolveReclaimedProfileRole({
      currentRole: "teacher",
      registrationRole: "student",
    }),
    "student"
  )
})

test("reclaim without registration intent keeps prior role", () => {
  assert.equal(
    resolveReclaimedProfileRole({
      currentRole: "teacher",
    }),
    "teacher"
  )
})

test("reclaim never overwrites admin", () => {
  assert.equal(
    resolveReclaimedProfileRole({
      currentRole: "admin",
      registrationRole: "teacher",
    }),
    "admin"
  )
})
