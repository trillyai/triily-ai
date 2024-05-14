// taginfo: https://taginfo.openstreetmap.org/tags
// test 'area' param: Ümraniye,Fatih
// test 'filter' param: views

import { getDistanceFromLatLonInKm } from "../utils/distance.js";

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
  let areaList = [];
  let filterList = [];
  const output = [];
  const timeout = 25;
  
  const { filter, area, distance } = req.query;
  const _distance = distance ?? 0.3;
  if (!area) {
   return res.status(400).send({
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

  let totLat = 0;
  let totLon = 0;

  for (const key of filterList) {
    if (Object.keys(filters).includes(key)) {
      for (const element of areaList) {
        await fetch(`https://overpass-api.de/api/interpreter`, {
          method: "POST",
          body:
            "data=" +
            encodeURIComponent(`
            [out:json][timeout:${timeout}];
            (area[name='${element}'];)->.a;
            (${filters[key]});
            out center;
        `),
        })
          .then((res) => res.json())
          .then((res) =>
            res.elements.map((node) => {
              let lat, lon;
              if (node.center) {
                lat = node.center.lat;
                lon = node.center.lon;
              } else if (node.lat && node.lon) {
                lat = node.lat;
                lon = node.lon;
              }
              totLat += lat;
              totLon += lon;

              res.elements.map((n) =>{
                if(getDistanceFromLatLonInKm(n.lat, n.lon, lat, lon) <= _distance && n.id !== node.id){
                  if(!node.closeNodes){
                    node.closeNodes = [];
                  }
                  node.closeNodes.push(n.id);
                }
              });
              
              let temp = output.map((e) => e.id).indexOf(node.id);
              if (temp === -1) {
                output.push({
                  id: node.id,
                  type: node.type,
                  tags: node.tags,
                  area: element,
                  filter: key,
                  lat,
                  lon,
                  closeNodes: node.closeNodes
                });
              } else {
                output[temp] = {
                  ...output[temp],
                  area: `${output[temp].area + "," + element}`,
                };
              }
            })
          );
      }
    }
  }

  const avgLat = totLat / output.length;
  const avgLon = totLon / output.length;

  res.status(200).send({
    data: output,
    avgLat,
    avgLon,
  });
}
