/**
 * The `code` on a thrown `LaynError`.
 *
 * The three hydration codes all mean the same class of mistake: the client is not configured the
 * way the server was.
 */
export type LaynErrorCode =
  | 'SERIALIZATION_VERSION_MISMATCH'
  | 'ALGORITHM_MISMATCH'
  | 'HYDRATION_MISMATCH'
  | 'OUT_OF_RANGE'
