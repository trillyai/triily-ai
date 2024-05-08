export async function generateTrip(req, res) {
  const timeout = 25;
  let result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    // The body contains the query
    // to understand the query language see "The Programmatic Query Language" on
    // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
    body:
      "data=" +
      encodeURIComponent(`
      [out:json][timeout:${timeout}];
      area[name="İstanbul"];
      nwr[tourism][tourism!="hostel"][tourism!="hotel"][tourism!="guest_house"][tourism!="apartment"](area)[tourism!="information"](area)[name](area);
      out center;
      `),
  }).then((res) => res.json());
  res.status(200).send({
    data: result,
  });
}
