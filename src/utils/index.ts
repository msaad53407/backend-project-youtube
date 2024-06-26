export function extractPublicID(url: string) {
  return `streamNow/${
    url
      .split("/")
      .splice(url.split("/").length - 2)[1]
      .split(".")[0]
  }`;
}
