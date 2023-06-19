import { createContentLoader } from 'vitepress';

const EXCLUDE_FILES = ['index.html', 'CHANGELOG.html'];

export default createContentLoader(`./web-api/*.md`, {
  transform(content) {
    return content.filter(
      (item) => !EXCLUDE_FILES.some((exclusion) => item.url.endsWith(exclusion))
    );
  },
});
