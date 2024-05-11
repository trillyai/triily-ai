// taginfo: https://taginfo.openstreetmap.org/tags
// test bbox value: 50.6,7.0,50.8,7.3  
// test bbox value belongs to  Bonn/Germany
const filters = {
  views: "nwr[tourism='viewpoint'];",
  historical: "nwr[~'^historic(:.*)?$'~'.'][~'^wiki.*?$'~'.'];",
  cultural:
    "nwr[tourism][name][wikidata][tourism!='hostel'][tourism!='hotel'][tourism!='viewpoint'][tourism!='guest_house'][tourism!='apartment'][tourism!='information'][tourism!='motel'][tourism!='caravan_site'];",
  //leisure:"nwr[~'^leisure(.*)?$'~'.''][name];",
  //cuisine: "nwr[amenity=restaurant][cuisine][name];",
  religious: "nwr[amenity=place_of_worship][wikipedia];",
};

export async function generateTrip(req, res) {
  let filterText = "";
  let filterList = [];
  const timeout = 25;
  const { bbox, filter } = req.query;

  if (!bbox) {
    res.status(400).send({
      data: {
        error: "Provide a Bounding Box",
      },
    });
  }

  if (filter) {
    filterList = filter.split(",").map((text) => text.trim());
  }

  for (const key of filterList) {
    if (Object.keys(filters).includes(key)) {
      filterText += filters[key];
    }
  }

  console.log(filterText);

  let result = await fetch(`https://overpass-api.de/api/interpreter`, {
    method: "POST",
    body:
      "data=" +
      encodeURIComponent(`
      [out:json][timeout:${timeout}][bbox:${bbox}];
      (${filterText});
      out center;
      `),
  }).then((res) => res.json());
  res.status(200).send({
    data: result,
  });
}
