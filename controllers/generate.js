// taginfo: https://taginfo.openstreetmap.org/tags
// test 'area' param: Ümraniye,Fatih
// test 'filter' param: views

const filters = {
  views: "nwr[tourism='viewpoint'](area.a);",
  historical: "nwr[~'^historic(:.*)?$'~'.'][~'^wiki.*?$'~'.'](area.a);",
  cultural:
    "nwr[tourism][name][wikidata][tourism!='hostel'][tourism!='hotel'][tourism!='viewpoint'][tourism!='guest_house'][tourism!='apartment'][tourism!='information'][tourism!='motel'][tourism!='caravan_site'](area.a);",
  //leisure:"nwr[~'^leisure(.*)?$'~'.''][name](area.a);",
  //cuisine: "nwr[amenity=restaurant][cuisine][name](area.a);",
  religious: "nwr[amenity=place_of_worship][wikipedia](area.a);",
};

export async function generateTrip(req, res) {
  let filterText = "";
  let areaText = "";
  let areaList = [];
  let filterList = [];
  const timeout = 25;
  const { bbox, filter, area } = req.query;

  if (!area) {
    res.status(400).send({
      data: {
        error: "Provide at least one area.",
      },
    });
  }

  if (filter) {
    filterList = filter.split(",").map((text) => text.trim());
  }
  if (area) {
    areaList = area.split(",").map((text) => text.trim());
  }

  for (const key of filterList) {
    if (Object.keys(filters).includes(key)) {
      filterText += filters[key];
    }
  }

  for (const element of areaList) {
    areaText += `area[name='${element}'];` 
  }

  console.log(areaText,filterText);

  let result = await fetch(`https://overpass-api.de/api/interpreter`, {
    method: "POST",
    body:
      "data=" +
      encodeURIComponent(`
      [out:json][timeout:${timeout}];
      (${areaText})->.a;
      (${filterText});
      out center;
      `),
  })
    .then((res) => res.json())
    .then((res) => res.elements);

  let totLat = 0;
  let totLon = 0;
  for (const node of result) {

    if (node.center) {
      totLat += node.center.lat;
      totLon += node.center.lon;
    } else if (node.lat && node.lon) {
      totLat += node.lat;
      totLon += node.lon;
    }
  }

  const avgLat = totLat / result.length;
  const avgLon = totLon / result.length;

  res.status(200).send({
    data: result,
    avgLat,
    avgLon,
  });
}
