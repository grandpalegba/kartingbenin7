import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { scrollToSlideTop } from '../utils/scrollHelper';
import { CHECKPOINTS, InteractiveCircuitMap } from './InteractiveCircuitMap';

interface CircuitNarrativeNavigatorProps {
  onSelectSlide: (index: number) => void;
  currentSlideIndex?: number;
}

export const CircuitNarrativeNavigator: React.FC<CircuitNarrativeNavigatorProps> = ({
  onSelectSlide,
  currentSlideIndex = 0
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSectorClick = (slideIdx: number) => {
    sound.playUiClick();
    onSelectSlide(slideIdx);
    scrollToSlideTop();
  };

  return (
    <div className="w-full rounded-2xl bg-[#08090d] border border-white/15 p-4 sm:p-7 shadow-2xl text-white relative overflow-hidden space-y-5">
      
      {/* Background Racing Atmosphere */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff1e00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header : Simple et épuré "CIRCUIT DU BÉNIN" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff1e00] animate-pulse shrink-0" />
          <h3 className="font-display italic font-black text-xl sm:text-2xl text-white tracking-tight uppercase">
            CIRCUIT DU BÉNIN
          </h3>
          <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
            10 STANDS
          </span>
        </div>

        <div className="font-mono text-xs text-[#ff1e00] font-bold bg-[#ff1e00]/10 border border-[#ff1e00]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
          <span>🏁</span>
          <span>CHOISIR UN STAND</span>
        </div>
      </div>

      {/* Main Grid: Exact Same Interactive Circuit Map on Col 5 + 10 Action Verb Cards on Col 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Exact same circuit map as on top of every page (100% unified) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <InteractiveCircuitMap
            currentSlideIndex={currentSlideIndex}
            onSelectSlide={handleSectorClick}
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
            className="w-full h-full"
          />
        </div>

        {/* 10 Stand Action Cards Grid (Stands 01 to 10 with Damier) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CHECKPOINTS.map((cp, idx) => {
            const isHovered = hoveredIndex === idx;
            const isCurrent = currentSlideIndex === cp.slideIndex;

            return (
              <div
                key={cp.standNumber}
                onClick={() => handleSectorClick(cp.slideIndex)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                  cp.isDamier
                    ? isHovered || isCurrent
                      ? 'bg-[#ff1e00] border-[#ff1e00] text-white shadow-[0_0_20px_rgba(255,30,0,0.5)] scale-[1.02]'
                      : 'bg-black border-[#ff1e00]/70 text-white hover:border-[#ff1e00]'
                    : isHovered || isCurrent
                    ? 'bg-white/12 border-[#ff1e00] shadow-[0_0_15px_rgba(255,30,0,0.25)] scale-[1.02]'
                    : 'bg-white/3 border-white/8 hover:border-white/20 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    cp.isDamier 
                      ? 'bg-black text-[#ff1e00] border border-[#ff1e00]' 
                      : idx === 0
                      ? 'bg-[#ff1e00] text-white'
                      : isHovered || isCurrent
                      ? 'bg-[#ff1e00] text-white'
                      : 'bg-white/10 text-[#ff1e00]'
                  }`}>
                    {cp.isDamier ? "🏁 10" : idx === 0 ? "01" : `STAND ${cp.standNumber}`}
                  </span>
                </div>

                {/* Verbes d'action : même taille exacte pour les deux verbes, DÉPART unique pour stand 1, TRANSMETTRE sans césure */}
                <div className="font-display font-bold text-[9.5px] sm:text-[10px] text-white uppercase tracking-tight group-hover:text-[#ff1e00] transition-colors leading-tight">
                  {idx === 0 ? (
                    <span className="block whitespace-nowrap overflow-visible">DÉPART</span>
                  ) : cp.verbs.includes('·') ? (
                    <div className="space-y-0.5">
                      <span className="block whitespace-nowrap overflow-visible break-keep [word-break:keep-all] hyphens-none">
                        {cp.verbs.split('·')[0].trim()}
                      </span>
                      <span className="block whitespace-nowrap overflow-visible break-keep [word-break:keep-all] hyphens-none text-white/90">
                        · {cp.verbs.split('·')[1].trim()}
                      </span>
                    </div>
                  ) : (
                    <span className="block whitespace-nowrap overflow-visible break-keep [word-break:keep-all] hyphens-none">
                      {cp.verbs}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
