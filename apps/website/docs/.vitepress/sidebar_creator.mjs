export function createSidebar(packageName, sidebar) {
  return {
    [`/${packageName}/`]: [
      {
        text: packageName,
        items: [
          ...sidebar,
          { text: 'Changelog', link: `/${packageName}/CHANGELOG` },
        ],
      },
    ],
  };
}
