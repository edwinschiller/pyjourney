"use client"

import { useEffect, useState } from "react"

import { PyjoCoach } from "@/components/lessons/player/pyjo-coach"

type IdePyjoTipProps = {
  code: string
}

/**
 * Slim IDE hook: local heuristic tip until snapshot analysis (Commit 14) lands.
 * Keeps PyJo present in free coding for the pitch story.
 */
export const IdePyjoTip = ({ code }: IdePyjoTipProps) => {
  const [tip, setTip] = useState(
    "I'm PyJo. While you code freely, I'll notice patterns and suggest practice later."
  )

  useEffect(() => {
    const trimmed = code.trim()
    if (!trimmed) {
      setTip("Start typing — I'll watch for syntax habits and suggest focused drills.")
      return
    }
    if (/==/.test(trimmed) && /print/.test(trimmed) && !/=(?!=)/.test(trimmed.replace(/==/g, ""))) {
      setTip("I see comparisons. If you meant to store a value, remember: one = assigns.")
      return
    }
    if (!/print\s*\(/.test(trimmed) && trimmed.split("\n").length > 3) {
      setTip("You've written a few lines without print — want to check an intermediate value?")
      return
    }
    if (/while\s+True/.test(trimmed)) {
      setTip("Infinite loops are easy to leave running — add a clear exit condition when you can.")
      return
    }
    setTip("Looking good. Finish a concept on the Learn path and I'll tailor harder quizzes to your pace.")
  }, [code])

  return <PyjoCoach speak={tip} className="shrink-0" />
}
