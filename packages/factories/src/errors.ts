export function factoryCalledDirectly() {
  return new Error(
    'Do not call factory directly, pass it to invoke function instead'
  );
}

export function invokeAcceptsOnlyFactories() {
  return new Error('Function passed to invoke is not created by createFactory');
}

export function factoryHasMoreThanOneArgument() {
  return new Error(
    'createFactory does not support functions with more than 1 argument'
  );
}
