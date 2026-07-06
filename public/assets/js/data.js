/* ============================================================
   DATA LAYER
   Every function returns a Promise<Array|Object>.

   If window.VNA_CONFIG.firebase.enabled is true (set in config.js),
   this reads LIVE data straight from your existing Firebase Realtime
   Database — the same one your Discord bot already writes to for
   the management website. If it's not enabled yet (or a Firebase
   read fails), it automatically falls back to the local mock JSON
   in /assets/data/ so the site still works while you're setting up.

   DATABASE PATHS ASSUMED (adjust the .ref('...') paths below if your
   bot uses different node names):
     /fleet          -> array/object of aircraft
     /routes         -> array/object of destinations
     /flights        -> array/object of scheduled flights
     /news           -> array/object of announcements
     /deals          -> array/object of promotions

   FIELD NAMES ASSUMED per record — rename the keys in the mapping
   functions below (mapFleet, mapFlight, etc.) to match whatever your
   bot actually stores if they differ.

   TO ACTIVATE:
     1. Fill in window.VNA_CONFIG.firebase in config.js (apiKey,
        authDomain, databaseURL, projectId — from your Firebase
        project settings, same project your bot uses).
     2. Set firebase.enabled = true in config.js.
     3. Make sure firebase-app-compat.js and
        firebase-database-compat.js are loaded before this file
        (they already are, on every page — see the <head> of any
        .html file).
   ============================================================ */

let _fbApp = null;
function getFirebaseDB() {
  const cfg = window.VNA_CONFIG && window.VNA_CONFIG.firebase;
  if (!cfg || !cfg.enabled || !cfg.databaseURL) return null;
  try {
    if (!_fbApp) {
      _fbApp = firebase.initializeApp({
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        databaseURL: cfg.databaseURL,
        projectId: cfg.projectId,
      });
    }
    return firebase.database();
  } catch (e) {
    console.warn('Firebase init failed, falling back to mock data:', e);
    return null;
  }
}

function snapToArray(snap) {
  const val = snap.val();
  if (!val) return [];
  return Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
}

async function readNode(path, mockFile, mapFn) {
  const db = getFirebaseDB();
  if (db) {
    try {
      const snap = await db.ref(path).once('value');
      const rows = snapToArray(snap);
      return mapFn ? rows.map(mapFn) : rows;
    } catch (e) {
      console.warn(`Firebase read failed for /${path}, using mock data:`, e);
    }
  }
  return fetch(`assets/data/${mockFile}`).then(r => r.json());
}

// Normalizes a raw bot fleet record into the shape the site's templates expect.
// Adjust the right-hand property names if your bot's fleet node uses different keys.
function mapFleet(a) {
  return {
    id: a.id || a.type || a.name,
    name: a.name || a.model || a.type,
    role: a.role || a.description || '',
    count: a.count ?? a.inService ?? a.quantity ?? 0,
    seats: a.seats || { economy: a.economySeats || 0, premiumEconomy: a.premiumEconomySeats || 0, business: a.businessSeats || 0 },
    range: a.range || '',
    image: a.image || a.imageUrl || '',
  };
}

function mapFlight(f) {
  return {
    flightNumber: f.flightNumber || f.flightNo || f.id,
    from: f.from || f.origin,
    to: f.to || f.destination,
    aircraft: f.aircraft || f.aircraftType,
    departure: f.departure || f.departureTime,
    arrival: f.arrival || f.arrivalTime,
    status: f.status || 'on-time',
    gate: f.gate || '—',
  };
}

const VNA_DATA = {
  async getFleet() { return readNode('fleet', 'fleet.json', mapFleet); },
  async getRoutes() { return readNode('routes', 'routes.json'); },
  async getFlights() { return readNode('flights', 'flights.json', mapFlight); },
  async getNews() { return readNode('news', 'news.json'); },
  async getDeals() { return readNode('deals', 'deals.json'); },
};
