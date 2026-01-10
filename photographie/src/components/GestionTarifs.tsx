import TarifConfigurator from "./admin/tarifs/TarifConfigurator";

export default function GestionTarifs() {
  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/5 shadow-xl p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 md:pb-6 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-serif italic text-[#ffe992] mb-1">
            Gestion des Tarifs
          </h2>
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">
            Configuration avancée (Catégories, Finitions, Tailles...)
          </p>
        </div>
      </div>

      <TarifConfigurator />
    </div>
  );
}
