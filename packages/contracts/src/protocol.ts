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
