//need to improve
export async function getWikimediaURL(title) {
  let image;
  await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${title}&cmtype=file&cmlimit=1&format=json`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.query && res.query.categorymembers) {
        image = encodeURI(
          "https://commons.wikimedia.org/wiki/Special:FilePath/" +
            res.query.categorymembers[0].title
        );
      }
    })
    .catch(() => {
      return;
    });

  return image;
}

export async function getWikipediaDesc(title, language = "en") {
  let desc;
  language = title.split(":")[0];
  title = title.split(":")[1];
  await fetch(
    `https://${language}.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.query.pages) {
        desc = Object.values(res.query.pages)[0].extract.split("\n")[0];
      }
    })
    .catch(() => {
      return;
    });
  return desc;
}

export async function getWikipediaImg(title, language = "en") {
  let imgURL;
  language = title.split(":")[0];
  title = title.split(":")[1];
  await fetch(
    `https://${language}.wikipedia.org/w/api.php?format=json&action=query&prop=pageimages&redirects=1&titles=${title}&pithumbsize=1920`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.query.pages) {
        imgURL = Object.values(res.query.pages)[0].thumbnail.source;
      }
    })
    .catch(() => {
      return;
    });
  return imgURL;
}

export async function getWikidataDesc(id, language = "en") {
  let desc;
  await fetch(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&search=${id}&language=${language}`
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.search) {
        desc = res.search[0].description;
      }
    })
    .catch(() => {
      return;
    });
  return desc;
}
