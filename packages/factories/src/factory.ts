export type Factory<C extends (params: any) => any> = {
  __: {
    create: C;
  };
};
