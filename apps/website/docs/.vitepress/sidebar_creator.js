export function createSidebar(packageName, sidebar) {
  return {
    [`/${packageName}/`]: [
      ...sidebar,
      { text: 'Changelog', link: `/${packageName}/CHANGELOG.md` },
    ],
  };
}
