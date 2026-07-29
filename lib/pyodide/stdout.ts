/** Pyodide stdout/stderr: write() delivers UTF-8 bytes (incl. \\n from print()). batched() often omits \\n. */

export const decodePyodideStreamChunk = (
  chunk: string | Uint8Array
): string => {
  if (typeof chunk === "string") {
    return chunk
  }
  if (chunk instanceof Uint8Array) {
    return new TextDecoder("utf-8").decode(chunk)
  }
  return String(chunk)
}
