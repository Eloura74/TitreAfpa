const API_URL = "http://localhost:5001/api";

// Routes à tester (méthodes protégées)
const protectedRoutes = [
  { method: "POST", url: "/galerie", data: { titre: "Test" } },
  { method: "PUT", url: "/galerie/fake-id", data: { titre: "Test" } },
  { method: "DELETE", url: "/galerie/fake-id" },
  { method: "POST", url: "/oeuvres-graphique", data: { titre: "Test" } },
  { method: "PUT", url: "/oeuvres-graphique/fake-id", data: { titre: "Test" } },
  { method: "DELETE", url: "/oeuvres-graphique/fake-id" },
  { method: "POST", url: "/albums", data: { titre: "Test" } },
  { method: "PUT", url: "/albums/fake-id", data: { titre: "Test" } },
  { method: "DELETE", url: "/albums/fake-id" },
];

async function checkSecurity() {
  console.log("🔒 Démarrage du test de sécurité API...\n");
  let passed = 0;
  let failed = 0;

  for (const route of protectedRoutes) {
    try {
      console.log(`Testing ${route.method} ${route.url}...`);

      const options = {
        method: route.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (route.data) {
        options.body = JSON.stringify(route.data);
      }

      // Tentative de requête SANS token
      const res = await fetch(`${API_URL}${route.url}`, options);

      if (res.status === 401 || res.status === 403) {
        console.log(`✅ OK: Rejeté avec status ${res.status}`);
        passed++;
      } else {
        console.error(
          `❌ FAIL: Accepté ou autre erreur (Status: ${res.status})`
        );
        failed++;
      }
    } catch (err) {
      console.error(`❌ Erreur technique: ${err.message}`);
      failed++;
    }
  }

  console.log("\n---------------------------------------------------");
  console.log(`Résultat: ${passed} succès, ${failed} échecs`);
  if (failed === 0) {
    console.log("✅ TOUTES LES ROUTES SONT SÉCURISÉES.");
  } else {
    console.log("⚠️ ATTENTION: CERTAINES ROUTES SONT VULNÉRABLES.");
  }
}

checkSecurity();
