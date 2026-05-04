/**
 * Computes the set of visible page numbers for pagination display.
 *
 * Always includes the first and last pages, plus a window of pages
 * around the current page (currentPage ± 2 within bounds).
 *
 * @param currentPage - The currently active page (1-based)
 * @param totalPages  - Total number of pages
 * @returns Sorted array of visible page numbers
 */
export function computeVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages])

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page)
    }
  }

  return [...pages].sort((a, b) => a - b)
}
