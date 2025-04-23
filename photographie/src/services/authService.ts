// Service d'authentification pour l'inscription et la connexion
export async function register(email: string, motdepasse: string) {
  const res = await fetch("http://localhost:5001/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motdepasse }),
  });
  return res.json();
}

export async function login(email: string, motdepasse: string) {
  const res = await fetch("http://localhost:5001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motdepasse }),
  });
  return res.json(); // retournera aussi le role
}
