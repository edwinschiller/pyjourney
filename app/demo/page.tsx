import type { Metadata } from "next"

import { JudgeDemo } from "@/components/demo/judge-demo"

export const metadata: Metadata = {
  title: "Guided product demo | PyJourney",
  description:
    "See how one Python mistake becomes a focused learning moment and an actionable classroom insight.",
}

const DemoPage = () => {
  return <JudgeDemo />
}

export default DemoPage
