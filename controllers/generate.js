// taginfo: https://taginfo.openstreetmap.org/tags

export async function generateTrip(req, res) {
  const {
    views,
    historical,
    cultural,
    outdoor,
    cuisine,
    religious,
    shopping,
    entertainment,
  } = req.query;
  const timeout = 25;
  let result = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body:
      "data=" +
      encodeURIComponent(`
      [out:json][timeout:${timeout}];
      area[name="İstanbul"]->.a;
      (
        nwr[tourism][name][wikidata][tourism!="hostel"][tourism!="hotel"][tourism!="viewpoint"][tourism!="guest_house"][tourism!="apartment"](area.a)[tourism!="information"](area.a)[tourism!="motel"][tourism!="caravan_site"];
        nwr[religion][wikipedia](area.a);
        nwr[tourism="viewpoint"](area.a);
        nwr[~"^historic(:.*)?$"~"."][~"^wiki.*?$"~"."](area.a);
      );
      out center;
      `),
  }).then((res) => res.json());
  res.status(200).send({
    data: result,
  });
}
