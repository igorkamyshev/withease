/**
 * A _Contract_ is a type that allows to check if a value is conform to a given structure.
 */
export type Contract<Raw, Data extends Raw> = {
  /**
   * Checks if Raw is Data
   */
  isData: (prepared: Raw) => prepared is Data;
  /**
   * - empty array is dedicated for valid response
   * - array of string with validation errors for invalidDataError
   */
  getErrorMessages: (prepared: Raw) => string[];
};
