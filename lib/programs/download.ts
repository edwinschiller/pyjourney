export const downloadTextFile = (content: string, filename: string) => {
  const safeName = filename.trim() || "program.py"
  const finalName = safeName.endsWith(".py") ? safeName : `${safeName}.py`

  const blob = new Blob([content], { type: "text/x-python;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = finalName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const slugifyFilename = (title: string) => {
  const slug = title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "program"
}
