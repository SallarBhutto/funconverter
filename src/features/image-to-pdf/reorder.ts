/**
 * Returns a copy of `items` with the element at `from` moved to `to`. Out of
 * range indices and no-op moves return the original array unchanged, so
 * callers can compare by reference to skip a state update.
 */
export function moveItem<T>(items: readonly T[], from: number, to: number): readonly T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
