export function sortByQrCode<T>(
  items: readonly T[] | undefined | null,
  getQrCode: (item: T) => string | undefined | null
): T[] {
  if (!items || items.length === 0) return [];
  return [...items].sort((a, b) =>
    (getQrCode(a) ?? "").localeCompare(getQrCode(b) ?? "", undefined, {
      sensitivity: "base",
    })
  );
}
