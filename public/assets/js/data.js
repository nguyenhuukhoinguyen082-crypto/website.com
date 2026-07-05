/* ============================================================
   DATA LAYER
   Every function here returns a Promise<Array|Object>.
   Right now they fetch the local mock JSON in /assets/data/.

   TO CONNECT YOUR REAL FIREBASE DATABASE (the same one your
   Discord bot already writes fleet/flights/loyalty data to):

   1. Add the Firebase SDK to each page's <head>:
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>

   2. Fill in window.VNA_CONFIG.firebase in config.js and set enabled: true.

   3. Replace the body of each function below with a Realtime
      Database read, for example:

        function getFleet() {
          return firebase.database().ref('fleet').once('value')
            .then(snap => Object.values(snap.val() || {}));
        }

      Your bot's existing write paths (fleet, flights, routes, news,
      deals, loyaltyTiers) should map 1:1 to the mock file names below,
      so no page-level code needs to change — only this file.
   ============================================================ */

const VNA_DATA = {
  async getFleet() {
    return fetch('assets/data/fleet.json').then(r => r.json());
  },
  async getRoutes() {
    return fetch('assets/data/routes.json').then(r => r.json());
  },
  async getFlights() {
    return fetch('assets/data/flights.json').then(r => r.json());
  },
  async getNews() {
    return fetch('assets/data/news.json').then(r => r.json());
  },
  async getDeals() {
    return fetch('assets/data/deals.json').then(r => r.json());
  },
};
