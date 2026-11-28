// zones.js — the five zones and zone transitions: the zone table,
// the zone for a distance, and the next zone's name.
var ZONES = ZONE_TABLE;

// zoneForDistance — which zone a distance in metres belongs to.
function zoneForDistance(m) {
  for (var i = 0; i < ZONES.length; i++) {
    if (m < ZONES[i].to || i === ZONES.length - 1) return ZONES[i];
  }
  return ZONES[ZONES.length - 1];
}

// zoneIndexForDistance — the 0-based index of the zone for a distance.
function zoneIndexForDistance(m) {
  for (var i = 0; i < ZONES.length; i++) {
    if (m < ZONES[i].to || i === ZONES.length - 1) return i;
  }
  return ZONES.length - 1;
}

// nextZoneName — the name of the zone after the given distance.
function nextZoneName(m) {
  var idx = zoneIndexForDistance(m);
  if (idx >= ZONES.length - 1) return 'FREEDOM GATE';
  return ZONES[idx + 1].name;
}

// zoneBannerText — the banner line shown when entering a zone.
function zoneBannerText(zone) {
  return 'ZONE ' + zone.n + '/5 — ' + zone.name;
}

// zoneProgress — fraction of the current zone completed, 0 to 1.
function zoneProgress(m) {
  var z = zoneForDistance(m);
  return Math.max(0, Math.min(1, (m - z.from) / (z.to - z.from)));
}
