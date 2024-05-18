//need to improve
export async function getWikimediaURL(title) {
  let image;
  await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&generator=images&prop=imageinfo&gimlimit=500&redirects=1&titles=${encodeURIComponent(
      title
    )}&iiprop=timestamp|user|userid|comment|canonicaltitle|url|size|dimensions|sha1|mime|thumbmime|mediatype|bitdepth`
  )
    .then((res) => res.json())
    .then((res) => {
      image = Object.values(res.query.pages)[0].imageinfo[0].url;
    })
    .catch(() => {
      return;
    });
  return image;
}
