const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function resolveAssetUrl(src?: string) {
  if (!src) {
    return "";
  }

  if (/^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  if (!src.startsWith("/")) {
    return src;
  }

  if (!publicBasePath || src === publicBasePath || src.startsWith(`${publicBasePath}/`)) {
    return src;
  }

  return `${publicBasePath}${src}`;
}
