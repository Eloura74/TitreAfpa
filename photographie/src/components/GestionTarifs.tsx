import TarifConfigurator from "./admin/tarifs/TarifConfigurator";

export default function GestionTarifs() {
  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion des Tarifs
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Configuration avancée (Catégories, Finitions, Tailles...)
          </p>
        </div>
      </div>

      <TarifConfigurator />
    </div>
  );
}
