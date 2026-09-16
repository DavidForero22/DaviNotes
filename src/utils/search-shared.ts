/**
 * Values shared by the search index (built on the server) and the search script (run in the browser).
 * Kept in its own file so the browser bundle does not include any server-only code.
 */

/** Separator placed between the cells of a table row in the search index. */
export const CELL_SEPARATOR = " · ";
