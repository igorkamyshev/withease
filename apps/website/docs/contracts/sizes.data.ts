export default {
  async load() {
    try {
      const [
        zodSize,
        runtypesSize,
        ioTsSize,
        fpTsSize,
        superstructSize,
        typedContractsSize,
        valibotSize,
      ] = await Promise.all([
        definePackageSize('zod', 'lib/index.js'),
        definePackageSize('runtypes', 'lib/index.js'),
        definePackageSize('io-ts', 'lib/index.js'),
        definePackageSize('fp-ts', 'lib/index.js'),
        definePackageSize('superstruct', 'dist/index.mjs'),
        definePackageSize('typed-contracts', 'lib/bundle.js'),
        definePackageSize('valibot', './dist/index.js'),
      ]);

      return [
        { name: 'Zod', size: zodSize },
        { name: 'runtypes', size: runtypesSize },
        { name: 'io-ts + fp-ts', size: ioTsSize + fpTsSize },
        { name: 'superstruct', size: superstructSize },
        { name: 'typed-contracts', size: typedContractsSize },
        { name: 'valibot', size: valibotSize },
      ];
    } catch (error) {
      return null;
    }
  },
};

async function definePackageSize(packageName, moduleName) {
  const response = await fetch(
    `https://esm.run/${packageName}@latest/${moduleName}`,
    {method: 'HEAD'},
  );

  const encodedSize = Number(response.headers.get('content-length') ?? 0);

  return encodedSize;
}
