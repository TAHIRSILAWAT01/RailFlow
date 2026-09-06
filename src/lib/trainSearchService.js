// Train Search Service - Generic, no hard-coded city names

const { getStore } = require('./store');

function getStationIndex(route, stationCode) {
  return route.indexOf(stationCode);
}

function getDuration(schedule, origin, destination) {
  // Simple string-based time diff (mock)
  const dep = schedule[origin]?.depart;
  const arr = schedule[destination]?.arrive;
  if (!dep || !arr) return 'N/A';
  const [dh, dm] = dep.split(':').map(Number);
  const [ah, am] = arr.split(':').map(Number);
  const depDay = schedule[origin]?.day || 1;
  const arrDay = schedule[destination]?.day || 1;
  const depMins = depDay * 1440 + dh * 60 + dm;
  const arrMins = arrDay * 1440 + ah * 60 + am;
  const diff = arrMins - depMins;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

function lookupAvailability(trainId, cls, origin, destination) {
  const store = getStore();
  const key = `${trainId}_${cls}_${origin}_${destination}`;
  const avail = store.availability[key];
  if (!avail) return { status: 'NOT_AVAILABLE', count: 0, fare: 0 };
  return avail;
}

function searchTrains(from, to, date, cls, passengers) {
  const store = getStore();
  const results = [];

  for (const train of store.trains) {
    const fromIdx = getStationIndex(train.route, from);
    const toIdx = getStationIndex(train.route, to);

    if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) continue;
    if (!train.classes.includes(cls)) continue;

    const avail = lookupAvailability(train.id, cls, from, to);
    const depTime = train.schedule[from]?.depart || 'N/A';
    const arrTime = train.schedule[to]?.arrive || 'N/A';

    results.push({
      trainId: train.id,
      trainNumber: train.number,
      trainName: train.name,
      origin: from,
      destination: to,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: getDuration(train.schedule, from, to),
      class: cls,
      availability: avail,
      fare: avail.fare,
      date
    });
  }

  return results;
}

function getSmartAlternates(from, to, cls, date, trainId) {
  const store = getStore();
  const alternates = [];

  // If trainId provided, only check that train; otherwise check all
  const trainsToCheck = trainId
    ? store.trains.filter(t => t.id === trainId)
    : store.trains;

  for (const train of trainsToCheck) {
    const fromIdx = getStationIndex(train.route, from);
    const toIdx = getStationIndex(train.route, to);

    if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) continue;
    if (!train.classes.includes(cls)) continue;

    // Find stations after the requested destination
    const laterStations = train.route.slice(toIdx + 1);

    for (const laterDest of laterStations) {
      const avail = lookupAvailability(train.id, cls, from, laterDest);
      if (avail.status === 'CONFIRMED' && avail.count > 0) {
        const stopsAfterDest = train.route.indexOf(laterDest) - toIdx;
        alternates.push({
          trainId: train.id,
          trainNumber: train.number,
          trainName: train.name,
          origin: from,
          destination: to,
          bookedDestination: laterDest,
          requestedDestination: to,
          departureTime: train.schedule[from]?.depart || 'N/A',
          arrivalAtRequested: train.schedule[to]?.arrive || 'N/A',
          arrivalAtBooked: train.schedule[laterDest]?.arrive || 'N/A',
          duration: getDuration(train.schedule, from, laterDest),
          class: cls,
          availability: avail,
          fare: avail.fare,
          stopsAfterDest,
          date,
          isRecommended: false,
          vacancySegment: `${to} → ${laterDest}`
        });
      }
    }
  }

  // Sort by: stopsAfterDest ASC (prefer closest alternate)
  alternates.sort((a, b) => a.stopsAfterDest - b.stopsAfterDest);

  // Mark first as recommended
  if (alternates.length > 0) {
    alternates[0].isRecommended = true;
  }

  return alternates;
}

function getStationName(code) {
  const store = getStore();
  const station = store.stations.find(s => s.code === code);
  return station ? station.name : code;
}

module.exports = { searchTrains, getSmartAlternates, getStationIndex, getDuration, getStationName, lookupAvailability };
