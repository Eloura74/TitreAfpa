import React from "react";

// ==========================================
// 📝 Interface des Props
// ==========================================
interface ClientCreationFormProps {
  showClientForm: boolean;
  setShowClientForm: (show: boolean) => void;
  clientForm: {
    nom: string;
    prenom: string;
    email: string;
    motdepasse: string;
    telephone: string;
    adresse: { rue: string; ville: string; codePostal: string; pays: string };
  };
  handleClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateClient: (e: React.FormEvent) => void;
}

// ==========================================
// 👤 Composant ClientCreationForm
// ==========================================
// Ce composant gère l'affichage et la logique du formulaire de création rapide d'un client.
// Il permet à l'administrateur de créer un compte client sans quitter la page de gestion.
export default function ClientCreationForm({
  showClientForm,
  setShowClientForm,
  clientForm,
  handleClientChange,
  handleCreateClient,
}: ClientCreationFormProps) {
  return (
    <div className="bg-[#232336] p-4 rounded border border-white/10">
      <label className="text-sm font-bold text-[#ffe992] mb-2 block">
        Client associé
      </label>

      {/* Bouton pour basculer l'affichage du formulaire */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setShowClientForm(!showClientForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded whitespace-nowrap text-sm transition-colors"
        >
          {showClientForm ? "Masquer le formulaire" : "Nouveau Client"}
        </button>
      </div>

      {/* Formulaire de création (affiché conditionnellement) */}
      {showClientForm && (
        <div className="bg-black/20 p-3 rounded border border-blue-500/30 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-blue-400 font-bold mb-3 text-sm">
            Créer un compte client
          </h4>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              name="nom"
              placeholder="Nom"
              value={clientForm.nom}
              onChange={handleClientChange}
              className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none transition-colors"
            />
            <input
              name="prenom"
              placeholder="Prénom"
              value={clientForm.prenom}
              onChange={handleClientChange}
              className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Email et Mot de passe */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              name="email"
              placeholder="Email"
              value={clientForm.email}
              onChange={handleClientChange}
              className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none transition-colors"
            />
            <input
              name="motdepasse"
              type="password"
              placeholder="Mot de passe"
              value={clientForm.motdepasse}
              onChange={handleClientChange}
              className="bg-[#181824] border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none transition-colors"
            />
            <span className="text-[10px] text-gray-400 col-span-2 text-right px-1">
              * 6 caractères minimum
            </span>
          </div>

          {/* Bouton de validation */}
          <button
            type="button"
            onClick={handleCreateClient}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded font-medium transition-colors mt-2"
          >
            Créer le compte
          </button>
        </div>
      )}
    </div>
  );
}
