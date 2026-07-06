/* ============================================================
   DATA LAYER
   Every function returns a Promise<Array|Object>.

   If window.VNA_CONFIG.firebase.enabled is true (set in config.js),
   this reads LIVE data straight from your existing Firebase Realtime
   Database — the same one your Discord bot already writes to for
   the management website. If it's not enabled yet (or a Firebase
   read fails), it automatically falls back to the local mock JSON
   in /assets/data/ so the site still works while you're setting up.
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

// Your fleet node stores INDIVIDUAL aircraft (each with its own tail number),
// not aggregated aircraft types. Real fields, confirmed from your database:
//   aircraft_type, created_at, description, display_name, full_registration,
//   has_business, image_url, passenger_capacity, service_status, tail_registration
// So getFleet groups those individual records by display_name and counts them.
function groupFleet(records) {
  const groups = {};
  records.forEach(a => {
    const key = a.display_name || a.aircraft_type || 'Unknown Aircraft';
    if (!groups[key]) {
      groups[key] = {
        name: key,
        role: a.description || '',
        image: a.image_url || '',
        capacity: a.passenger_capacity || 0,
        hasBusiness: !!a.has_business,
        aircraftType: a.aircraft_type || '',
        count: 0,
        activeCount: 0,
      };
    }
    groups[key].count++;
    if ((a.service_status || '').toLowerCase().includes('active')) groups[key].activeCount++;
  });
  return Object.values(groups);
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
  // Fleet is intentionally static — kept in assets/data/fleet.json with your
  // real aircraft names, images, and descriptions. Not synced from Firebase.
  async getFleet() {
    return fetch('assets/data/fleet.json').then(r => r.json());
  },
  async getRoutes() { return readNode('routes', 'routes.json'); },
  async getFlights() { return readNode('flights', 'flights.json', mapFlight); },
  async getNews() { return readNode('news', 'news.json'); },
  async getDeals() { return readNode('deals', 'deals.json'); },
};