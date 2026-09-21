const fs = require('fs');
const { geoContains } = require('d3-geo');
const topojson = require('topojson-client');
const { data: rows } = require('./parse.js');

const us = require('us-atlas/states-10m.json');
const geo = topojson.feature(us, us.objects.states);

// FIPS -> USPS abbr + name (standard 50 states + DC; territories dropped from map but kept as "no state")
const FIPS = {
  "01":["AL","Alabama"],"02":["AK","Alaska"],"04":["AZ","Arizona"],"05":["AR","Arkansas"],"06":["CA","California"],
  "08":["CO","Colorado"],"09":["CT","Connecticut"],"10":["DE","Delaware"],"11":["DC","District of Columbia"],
  "12":["FL","Florida"],"13":["GA","Georgia"],"15":["HI","Hawaii"],"16":["ID","Idaho"],"17":["IL","Illinois"],
  "18":["IN","Indiana"],"19":["IA","Iowa"],"20":["KS","Kansas"],"21":["KY","Kentucky"],"22":["LA","Louisiana"],
  "23":["ME","Maine"],"24":["MD","Maryland"],"25":["MA","Massachusetts"],"26":["MI","Michigan"],"27":["MN","Minnesota"],
  "28":["MS","Mississippi"],"29":["MO","Missouri"],"30":["MT","Montana"],"31":["NE","Nebraska"],"32":["NV","Nevada"],
  "33":["NH","New Hampshire"],"34":["NJ","New Jersey"],"35":["NM","New Mexico"],"36":["NY","New York"],
  "37":["NC","North Carolina"],"38":["ND","North Dakota"],"39":["OH","Ohio"],"40":["OK","Oklahoma"],"41":["OR","Oregon"],
  "42":["PA","Pennsylvania"],"44":["RI","Rhode Island"],"45":["SC","South Carolina"],"46":["SD","South Dakota"],
  "47":["TN","Tennessee"],"48":["TX","Texas"],"49":["UT","Utah"],"50":["VT","Vermont"],"51":["VA","Virginia"],
  "53":["WA","Washington"],"54":["WV","West Virginia"],"55":["WI","Wisconsin"],"56":["WY","Wyoming"],
  "72":["PR","Puerto Rico"]
};

geo.features.forEach(f => { f.abbr = (FIPS[f.id] || [null])[0]; f.stateName = (FIPS[f.id] || [null, null])[1]; });

// raw (unprojected) GeoJSON for Leaflet - it does its own projection from lat/lng
const stateGeo = {
  type: 'FeatureCollection',
  features: geo.features
    .filter(f => f.abbr && f.abbr !== 'PR')
    .map(f => ({ type: 'Feature', properties: { abbr: f.abbr, name: f.stateName }, geometry: f.geometry }))
};

// derive true state per rooftop from lat/lng via point-in-polygon, since the sheet's free-text state column is inconsistent
function deriveState(lng, lat) {
  for (const f of geo.features) {
    if (f.abbr && geoContains(f, [lng, lat])) return f.abbr;
  }
  return null;
}

const ABBR_TO_NAME = {};
geo.features.forEach(f => { if (f.abbr) ABBR_TO_NAME[f.abbr] = f.stateName; });

const rooftops = rows.map(r => {
  let lat = null, lng = null;
  try { const g = JSON.parse(r.geo_coordinates); lat = g.lat; lng = g.lng; } catch (e) {}
  const abbr = (lat != null && lng != null) ? deriveState(lng, lat) : null;
  return {
    id: r.rooftop_id,
    name: r.rooftop_name,
    enterpriseId: r.enterprise_id,
    enterprise: r.enterprise_name,
    csm: r.csm_poc,
    stage: r['Product Stage'],
    city: r.city,
    state: abbr ? ABBR_TO_NAME[abbr] : null,
    stateAbbr: abbr,
    zip: r.zipcode,
    accountType: r.account_type,
    accountSubType: r.account_sub_type,
    lat, lng
  };
});

const noState = rooftops.filter(r => !r.stateAbbr).length;
console.error('rooftops:', rooftops.length, 'unmatched to a US state:', noState);

fs.writeFileSync('state-geo.json', JSON.stringify(stateGeo));
fs.writeFileSync('rooftops.json', JSON.stringify(rooftops));
console.error('wrote state-geo.json (' + stateGeo.features.length + ' states) and rooftops.json');
