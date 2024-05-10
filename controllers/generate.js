// taginfo: https://taginfo.openstreetmap.org/tags

const filters = {
  views: "nwr[tourism='viewpoint'](area.a);",
  historical: "nwr[~'^historic(:.*)?$'~'.'][~'^wiki.*?$'~'.'](area.a);",
  cultural:
    "nwr[tourism][name][wikidata][tourism!='hostel'][tourism!='hotel'][tourism!='viewpoint'][tourism!='guest_house'][tourism!='apartment'](area.a)[tourism!='information'](area.a)[tourism!='motel'][tourism!='caravan_site'];",
  //leisure:"nwr[~'^leisure(.*)?$'~'.''][name](area.a);",
  //cuisine: "nwr[amenity=restaurant][cuisine][name](area.a);",
  religious: "nwr[amenity=place_of_worship][wikipedia](area.a);",
};

export async function generateTrip(req, res) {
  let filterText = "";
  let filter;
  const timeout = 25;

  if (req.query.filter) {
    filter = req.query.filter.split(",").map((text)=>text.trim());
  }

  for (const key of filter) {
    if (Object.keys(filters).includes(key)) {
      filterText += filters[key];
    }
  }

  let result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body:
      "data=" +
      encodeURIComponent(`
      [out:json][timeout:${timeout}];
      area[name="İstanbul"]->.a;
      (
        ${filterText}
      );
      out center;
      `),
  }).then((res) => res.json());
  res.status(200).send({
    data: result,
  });
}
