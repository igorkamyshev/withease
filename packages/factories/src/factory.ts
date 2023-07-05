export type Factory<P, R> = {
  __: {
    create: (params: P) => R;
  };
};
