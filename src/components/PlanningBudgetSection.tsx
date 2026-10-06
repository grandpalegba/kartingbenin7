import React, { useState } from 'react';
import { 
  CheckCircle2, 
  PlusCircle, 
  Calendar, 
  FileText, 
  Layers, 
  Sparkles, 
  Cpu, 
  Film, 
  Music, 
  Sliders, 
  Check, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { PROPOSAL_DATA } from '../data/proposalData';
import { sound } from '../utils/audio';
import { VerticalCircuitCalendar } from './VerticalCircuitCalendar';

export const PlanningBudgetSection: React.FC = () => {
  const [includeDigitalPack, setIncludeDigitalPack] = useState<boolean>(false);
  const budget = PROPOSAL_DATA.financialBudget;
  const planning = PROPOSAL_DATA.planning;
  const digitalOption = PROPOSAL_DATA.digitalPackOption;
  const paymentTerms = PROPOSAL_DATA.paymentTerms;

  const totalCalculated = PROPOSAL_DATA.totalBaseHT + (includeDigitalPack ? digitalOption.priceFCFA : 0);
  const totalFormatted = new Intl.NumberFormat('fr-FR').format(totalCalculated) + " FCFA HT";

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'preproduction':
        return { label: 'Préproduction & BIM', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'production':
        return { label: 'Production 3D & IA', color: 'text-[#ff1e00] bg-[#ff1e00]/10 border-[#ff1e00]/30' };
      case 'postproduction':
        return { label: 'Postprod & Master 4K', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'management':
        return { label: 'Direction & Suivi', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { label: 'Production', color: 'text-neutral-400 bg-white/5 border-white/10' };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. FICHE OFFICIELLE D'APPEL D'OFFRES — ENTÊTE RACING */}
      <div className="rounded-2xl bg-[#0b0d13] border border-white/15 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff1e00]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-[#ff1e00] text-white font-mono text-[10px] font-black uppercase tracking-widest">
                OFFRE OFFICIELLE
              </span>
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
                APPEL D'OFFRES AUDIOVISUEL
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase">
              BUDGET DE PRODUCTION
            </h2>
            <div className="text-xs sm:text-sm text-neutral-300 font-sans mt-2 flex items-center flex-wrap gap-1.5">
              <span className="font-display italic font-black text-white text-sm sm:text-base">GO</span>
              <span className="font-display italic font-black text-[#ff1e00] text-sm sm:text-base">BEYOND</span>
              <span className="text-white/40 mx-1">—</span>
              <span>Film de présentation &amp; de commercialisation du projet Karting</span>
            </div>
          </div>

          {/* Grid Client / Prestataire / Format */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/4 p-3.5 rounded-xl border border-white/8 font-mono text-xs shrink-0">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Client</span>
              <span className="font-bold text-white">KOFFI &amp; DIABATÉ</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Prestataire</span>
              <span className="font-bold text-[#ff1e00]">AFRIKAFUN Prod.</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Durée cible</span>
              <span className="font-bold text-white">2'30 à 3'00</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Format master</span>
              <span className="font-bold text-white">16:9 — UHD / 4K</span>
            </div>
          </div>
        </div>

        {/* Positionnement Stratégique */}
        <div className="mt-5 p-4 rounded-xl bg-white/3 border-l-4 border-[#ff1e00] text-xs sm:text-[13px] text-neutral-200 leading-relaxed font-sans">
          <span className="font-bold text-white">Positionnement : </span>
          {PROPOSAL_DATA.positioningStatement}
        </div>
      </div>

      {/* 2. DÉCOMPOSITION DES 10 POSTES DE PRODUCTION (TABLEAU OFFICIEL) */}
      <div className="rounded-2xl bg-[#090b0f] border border-white/15 overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-6 bg-white/3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#ff1e00] font-bold uppercase tracking-wider">
                SECTION 1
              </span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-xs text-neutral-400 uppercase">
                DÉCOMPOSITION DES COÛTS HT
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-2xl text-white uppercase tracking-tight mt-0.5">
              1. BUDGET — FILM GO BEYOND
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
              Devise : <span className="text-white font-bold">Franc CFA (FCFA HT)</span>
            </span>
          </div>
        </div>

        {/* Table responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6 w-16 text-center">N°</th>
                <th className="py-3 px-4 sm:px-6">Poste de production</th>
                <th className="py-3 px-4 sm:px-6 hidden md:table-cell">Domaine technique</th>
                <th className="py-3 px-4 sm:px-6 text-right">Montant HT (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {budget.map((item, idx) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <tr key={item.id} className="hover:bg-white/4 transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-bold text-neutral-400 group-hover:text-[#ff1e00]">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-white group-hover:text-white">
                      {item.prestation}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-white tabular-nums text-sm group-hover:text-[#ff1e00] transition-colors">
                      {item.montantFormatted}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sous-total Film Go Beyond */}
        <div className="p-5 sm:p-7 bg-black/80 border-t-2 border-[#ff1e00]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm uppercase text-[#ff1e00] tracking-wider">
                TOTAL FILM GO BEYOND
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px]">
                10 POSTES INCLUS
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Production complète du film cinématographique UHD / 4K (2'30 à 3'00)
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,30,0,0.3)]">
              {PROPOSAL_DATA.totalBaseHTFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* 3. OPTION PACK DIGITAL (INTERACTIVE ADD-ON) */}
      <div className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl p-5 sm:p-7 ${
        includeDigitalPack 
          ? 'bg-[#121520] border-[#ff1e00] shadow-[0_0_30px_rgba(255,30,0,0.25)]' 
          : 'bg-[#0b0d13] border-white/15 hover:border-white/30'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#ff1e00]/20 text-[#ff1e00] border border-[#ff1e00]/40 font-mono text-[11px] font-bold uppercase tracking-wider">
                SECTION 3 · OPTION
              </span>
              <span className="font-mono text-xs text-neutral-400">RÉSEAUX SOCIAUX &amp; VALORISATION</span>
            </div>

            <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
              {digitalOption.title} — 2 000 000 FCFA HT
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              {digitalOption.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {digitalOption.items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/4 border border-white/8 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ff1e00] shrink-0 mt-0.5" />
                  <span className="text-xs text-neutral-200 leading-snug">{it}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Interactive Button */}
          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 pt-2 lg:pt-0">
            <div className="text-right">
              <span className="text-[11px] font-mono text-neutral-400 uppercase block">Montant de l'option</span>
              <span className="font-mono font-black text-2xl text-white">
                {digitalOption.priceFormatted}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIncludeDigitalPack(!includeDigitalPack);
                sound.playUiClick();
              }}
              className={`px-5 py-3 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                includeDigitalPack
                  ? 'bg-[#ff1e00] text-white shadow-lg shadow-[#ff1e00]/40 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40'
              }`}
            >
              {includeDigitalPack ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>PACK DIGITAL ACTIVÉ</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>+ AJOUTER LE PACK DIGITAL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. GRAND TOTAL RÉCAPITULATIF DYNAMIQUE */}
      <div className="rounded-2xl bg-gradient-to-r from-black via-[#0d0f15] to-black border-2 border-white/20 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff1e00] font-bold block">
            RÉCAPITULATIF DE LA PROPOSITION FINANCIÈRE
          </span>
          <h4 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
            TOTAL GÉNÉRAL DE L'OFFRE {includeDigitalPack ? "(AVEC PACK DIGITAL)" : "(FILM SEUL)"}
          </h4>
          <p className="text-xs text-neutral-400 font-mono">
            Document de travail — Budget indicatif HT · Offre valable 60 jours
          </p>
        </div>

        <div className="text-center md:text-right">
          <span className="font-mono font-black text-3xl sm:text-5xl text-white tracking-tight drop-shadow-[0_0_25px_rgba(255,30,0,0.45)]">
            {totalFormatted}
          </span>
          {includeDigitalPack && (
            <span className="block text-[11px] font-mono text-[#ff1e00] font-bold mt-1">
              ✓ Film Master 15M + Pack Digital 2M FCFA HT inclus
            </span>
          )}
        </div>
      </div>

      {/* 5. PÉRIMÈTRE INCLUS (SECTION 2 DU PDF) */}
      <div className="rounded-2xl bg-white text-neutral-900 p-6 sm:p-8 shadow-2xl border border-neutral-200">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-5">
          <span className="font-mono text-xs text-[#ff1e00] font-bold uppercase tracking-wider">
            SECTION 2
          </span>
          <span className="text-neutral-300">|</span>
          <h3 className="font-display font-bold text-base sm:text-lg text-neutral-900 uppercase tracking-tight">
            PÉRIMÈTRE INCLUS DANS LA PROPOSITION
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-[13px] font-sans">
          {PROPOSAL_DATA.scopeIncluded.map((scope, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3 hover:border-[#ff1e00]/40 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#ff1e00]/10 text-[#ff1e00] flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-[10px]">
                {idx + 1}
              </div>
              <p className="text-neutral-700 leading-relaxed font-normal">
                {scope}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. PLANNING INDICATIF EN CIRCUIT VERTICAL & MODALITÉS DE RÈGLEMENT (SECTIONS 4 & 5 DU PDF) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Planning Indicatif — Le Grand Circuit Vertical des Semaines (Col 7) */}
        <div className="lg:col-span-7">
          <VerticalCircuitCalendar />
        </div>

        {/* Modalités Financières Proposées (Feux de départ 40% / 40% / 20%) (Col 5) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0b0d13] border border-white/15 p-5 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-white/10 pb-3 mb-4">
              <span className="font-mono text-[10px] text-[#ff1e00] font-bold uppercase tracking-wider block">
                SECTION 5 · JALONS
              </span>
              <h4 className="font-display font-bold text-base sm:text-lg text-white uppercase tracking-tight">
                CONDITIONS FINANCIÈRES PROPOSÉES
              </h4>
            </div>

            <div className="space-y-3 font-sans">
              {paymentTerms.map((term, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Feux de départ karting */}
                      <span className={`w-3.5 h-3.5 rounded-full ${
                        idx === 0 
                          ? 'bg-[#ff1e00] shadow-[0_0_10px_rgba(255,30,0,0.8)]' 
                          : idx === 1 
                          ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' 
                          : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                      }`} />
                      <span className="font-mono font-bold text-sm text-white">
                        {term.trigger}
                      </span>
                    </div>
                    <span className="font-mono font-black text-base text-white px-2 py-0.5 rounded bg-white/10">
                      {term.percent} %
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed pl-6">
                    {term.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Validation & Signature Note */}
          <div className="p-4 rounded-xl bg-[#ff1e00]/10 border border-[#ff1e00]/30 text-xs font-mono text-neutral-300 space-y-1">
            <span className="text-[#ff1e00] font-bold block uppercase">
              AFRIKAFUN PRODUCTION — ENGAGEMENT
            </span>
            <p className="text-[11px] leading-relaxed">
              Dossier commercial &amp; technique prêt pour contractualisation et lancement immédiat avec KOFFI &amp; DIABATÉ.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
