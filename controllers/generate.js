// taginfo: https://taginfo.openstreetmap.org/tags
// test 'area' param: Ümraniye,Fatih
// test 'filter' param: views

import { getDistanceFromLatLonInKm } from "../utils/distance.js";
import {
  getWikidataDesc,
  getWikimediaURL,
  getWikipediaDesc,
  getWikipediaImg,
} from "../utils/wiki.js";

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
  const maxPlaces = 3;

  const { filter, area, distance } = req.query;
  //default distance value (to make group the places) is 300m
  const _distance = distance ?? 0.3;

  // if area does not provided throw an error
  if (!area) {
    return res.status(400).send({
      data: {
        error: "Provide at least one area.",
      },
    });
  }
  // create filter array
  if (filter) {
    filterList = filter.split(",").map((text) => text.trim());
  }
  // create area array
  if (area) {
    areaList = area.split(",").map((text) => text.trim());
  }

  const counts = {};
  for (const key of filterList) {
    counts[key] = 0;
  }

  // averages lat and lon values for each area to choose initial point for each and number of nodes by filter

  const info = {};
  for (const element of areaList) {
    info[element] = { avgLat: 0, avgLon: 0, counts: { ...counts } };
  }

  // send a request to gather data for each filter and area
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
              // gather lat, lon in different ways in case the type is polygon or smth.
              let lat, lon;
              if (node.center) {
                lat = node.center.lat;
                lon = node.center.lon;
              } else if (node.lat && node.lon) {
                lat = node.lat;
                lon = node.lon;
              }
              // collect and create avg values for each area

              info[element].avgLat =
                (info[element].avgLat + lat) /
                (info[element].avgLat === 0 ? 1 : 2);
              info[element].avgLon =
                (info[element].avgLon + lon) /
                (info[element].avgLon === 0 ? 1 : 2);
              info[element].counts[key] += 1;
              // if the element have close nodes save their ids.
              res.elements.map((n) => {
                if (
                  getDistanceFromLatLonInKm(n.lat, n.lon, lat, lon) <=
                    _distance &&
                  n.id !== node.id
                ) {
                  if (!node.closeNodes) {
                    node.closeNodes = [];
                  }
                  node.closeNodes.push({ id: n.id, filter: key });
                }
              });
              // if output array has some conflict nodes, ignore them and add new ones.
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
                  closeNodes: node.closeNodes,
                });
              } else {
                output[temp] = {
                  ...output[temp],
                  area: output[temp].area.split(",").includes(element)
                    ? output[temp].area
                    : `${output[temp].area + "," + element}`,
                  filter: output[temp].filter.split(",").includes(key)
                    ? output[temp].filter
                    : `${output[temp].filter + "," + key}`,
                };
              }
            })
          );
      }
    }
  }

  const sorted = output
    .map((element) => {
      return {
        ...element,
        score: scoreNode(element, filterList),
      };
    })
    .sort((a, b) => b.score - a.score);

  const result = [];
  for (const a of areaList) {
    let count = 0;
    for (const n of sorted) {
      if (
        n.area.split(",").includes(a) &&
        count < maxPlaces &&
        result.filter((r) => r.id === n.id).length === 0
      ) {
        const temp = await shapeResult(n, sorted);
        result.push(temp);
        count++;
      }
    }
  }
  res.status(200).send({
    data: result,
    info,
  });
}

function scoreNode(node, mainFilter) {
  let score = 0;

  score += Math.floor(Object.keys(node.tags).length / 10);

  if (node.closeNodes) {
    score += Math.floor(node.closeNodes.length / 3);
    node.closeNodes.forEach((element) => {
      const others = mainFilter.filter((e) => e !== node.filter.split(",")[0]);
      if (others.includes(element.filter.split(",")[0])) {
        score += 1;
      }
    });
  }
  const filterLength = node.filter.split(",").length;
  score += filterLength > 1 ? filterLength * 3 : 0;
  return score;
}

async function shapeResult(n,nodes, type="parent") {

  const imgURL = n.tags.wikipedia
    ? await getWikipediaImg(n.tags.wikipedia)
    : n.tags.wikimedia_commons
    ? await getWikimediaURL(n.tags.wikimedia_commons)
    : undefined;
  const wikidata = n.tags.wikidata
    ? await getWikidataDesc(n.tags.wikidata)
    : undefined;
  const wikipedia = n.tags.wikipedia
    ? await getWikipediaDesc(n.tags.wikipedia)
    : undefined;
  const desc = wikidata ?? wikipedia ?? undefined;
  const closeNodes = []
  if(n.closeNodes && type === "parent" ){
    for(const closeNode of n.closeNodes){
      closeNodes.push(await shapeResult(nodes.find((_n)=>_n.id === closeNode.id),nodes, "child")) 
    }
  }
  return {
    id: n.id,
    name: n.tags.name,
    lat: n.lat,
    lon: n.lon,
    filter: n.filter,
    area: n.area,
    imgURL,
    desc,
    closeNodes: closeNodes.length>0 ? closeNodes : undefined
  };
}
