export function readValue<T>(getter: () => T, defaultValue: T): T {
  try {
    return getter();
  } catch (e) {
    return defaultValue;
  }
}
