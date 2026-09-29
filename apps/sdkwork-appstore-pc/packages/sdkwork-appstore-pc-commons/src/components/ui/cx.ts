/**
 * Join class names, dropping falsey entries.
 *
 * Local on purpose: this package must not add a runtime dependency just to
 * concatenate strings, and every consumer already has React as a peer.
 * @param parts - class names or falsey slots to skip.
 * @returns the joined class string.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
