import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useUser } from "../context/UserContext";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";

interface Paiement {
  _id: string;
  montant: number;
  date: string;
  source: string;
  transactionId?: string;
  statut: string;
  articles?: unknown[]; // Si on veut afficher le détail plus tard
}

export default function MonCompte() {
  const { email, logout } = useAuthStore();
  const { user } = useUser();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (email) {
      const token = localStorage.getItem("token");

      axios
        .get(`${API_URL}/api/paiements/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setPaiements(res.data);
        })
        .catch((err) => console.error("Erreur chargement historique:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [email]);

  if (!email) {
    return (
      <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-[#ffe992] mb-4">
            Mon Compte
          </h1>
          <p className="mb-6 text-gray-400">
            Vous devez être connecté pour accéder à votre espace.
          </p>
          <Link to="/login" className="btn btn-primary">
            Se connecter
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col mt-18">
      <Navbar />
      <div className="flex-1 container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#ffe992]">Mon Espace</h1>
            <p className="text-gray-400 mt-1">
              Bienvenue, <span className="text-white font-semibold">{user.prenom} {user.nom}</span> ({email})
            </p>
            {user.telephone && (
              <p className="text-sm text-gray-500 mt-1">📞 {user.telephone}</p>
            )}
            {user.adresse && (
              <p className="text-sm text-gray-500">
                📍 {user.adresse.rue}, {user.adresse.codePostal} {user.adresse.ville}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="btn btn-sm btn-outline btn-error"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid gap-8">
          {/* Section Historique des commandes */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📦 Mes Commandes
            </h2>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <span className="loading loading-spinner text-[#ffe992]"></span>
                </div>
              ) : paiements.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Vous n'avez pas encore passé de commande.
                  <br />
                  <Link to="/galerie" className="text-[#ffe992] hover:underline mt-2 inline-block">
                    Découvrir la galerie
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                      <tr>
                        <th>Date</th>
                        <th>Référence</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Moyen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {paiements.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-800/50">
                          <td className="font-mono text-sm">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="text-xs text-gray-500 font-mono">
                            {p.transactionId || p._id}
                          </td>
                          <td className="font-bold text-[#ffe992]">
                            {p.montant.toFixed(2)} €
                          </td>
                          <td>
                            <span className={`badge badge-sm ${
                              p.statut === "payé" ? "badge-success" : "badge-warning"
                            }`}>
                              {p.statut}
                            </span>
                          </td>
                          <td className="text-xs uppercase text-gray-500">
                            {p.source}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
