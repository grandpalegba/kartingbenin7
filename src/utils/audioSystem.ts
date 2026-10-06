/**
 * AFRIKAFUN - IMMERSIVE AUDIO SYSTEM
 * 
 * Moteur audio cinématique procédural Web Audio haute fidélité (Approche A) :
 * - Aucune dépendance externe ni fichier mp3 manquant.
 * - 10 compositions musicales ambiantes distinctes et évolutives (Slides 1 à 10, y compris la page Budget).
 * - 10 designs sonores réalistes narratifs synchronisés aux étapes cinématographiques du projet.
 * - Transitions en fondu croisé (cross-fade) douces lors de la navigation entre les pages.
 * - Bus séparés : Master, Musique, Ambiance, Effets Réalistes (SFX).
 */

export interface AudioMixerState {
  isMuted: boolean;
  masterVolume: number;
  musicVolume: number;
  ambienceVolume: number;
  sfxVolume: number;
  currentSection: string;
  currentSlideNumber: number;
  currentSoundTitle: string;
  isMusicPlaying: boolean;
  isPlayingRealisticFx: boolean;
}

export const AUDIO_FILE_PATHS = {
  ambienceEarth: "/assets/audio/ambience-earth.mp3",
  kartChild: "/assets/audio/kart-child.mp3",
  design: "/assets/audio/design.mp3",
  buildUp: "/assets/audio/build-up.mp3",
  countdown: "/assets/audio/countdown.mp3",
  race: "/assets/audio/race.mp3",
  final: "/assets/audio/final.mp3",
  musicTheme: "/assets/audio/music-theme.mp3",
};

type Listener = (state: AudioMixerState) => void;

class CinematicAudioSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // OFF by default (autoplay policy)
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Channel volumes (0 to 1)
  private masterVol = 0.85;
  private musicVol = 0.75;
  private ambienceVol = 0.70;
  private sfxVol = 0.90;

  private currentSection = "slide_1";
  private currentSlideNumber: number = 1;
  private isMusicPlaying: boolean = false;
  private isPlayingRealisticFx: boolean = false;
  private listeners: Listener[] = [];

  // Active procedural nodes & intervals for continuous music & ambiance
  private activeMusicOscs: OscillatorNode[] = [];
  private activeMusicGains: GainNode[] = [];
  private activeAmbienceNodes: AudioNode[] = [];
  private activeIntervals: number[] = [];

  constructor() {
    // Initialized upon first user interaction
  }

  public subscribe(fn: Listener) {
    this.listeners.push(fn);
    fn(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }

  public getState(): AudioMixerState {
    return {
      isMuted: this.isMuted,
      masterVolume: this.masterVol,
      musicVolume: this.musicVol,
      ambienceVolume: this.ambienceVol,
      sfxVolume: this.sfxVol,
      currentSection: this.currentSection,
      currentSlideNumber: this.currentSlideNumber,
      currentSoundTitle: this.getSlideSoundTitle(this.currentSlideNumber),
      isMusicPlaying: this.isMusicPlaying,
      isPlayingRealisticFx: this.isPlayingRealisticFx,
    };
  }

  public getSlideNumber(): number {
    return this.currentSlideNumber;
  }

  public setSlide(slideNumber: number) {
    if (this.currentSlideNumber === slideNumber && this.activeMusicOscs.length > 0) {
      return;
    }
    this.currentSlideNumber = slideNumber;
    this.currentSection = `slide_${slideNumber}`;
    this.notify();

    // Never play sound automatically if muted or if music was not explicitly started
    if (!this.isMuted && this.isMusicPlaying) {
      this.initAudio();
      this.updateSlideAmbience(slideNumber);
    }
  }

  /**
   * Lance l'expérience sonore complète superposant les deux couches :
   * 1) La musique cinématique continue de la page
   * 2) Le design sonore réaliste concret de la scène
   */
  public playFullImmersion(slideNumber?: number) {
    const targetSlide = slideNumber || this.currentSlideNumber;
    this.currentSlideNumber = targetSlide;
    this.currentSection = `slide_${targetSlide}`;
    this.initAudio();
    this.isMuted = false;
    this.isMusicPlaying = true;

    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }

    this.updateSlideAmbience(targetSlide);
    this.playSlideSoundDesign(targetSlide);
    this.notify();
  }

  /**
   * Active ou désactive la musique d'ambiance seule
   */
  public toggleMusic(slideNumber?: number): boolean {
    const targetSlide = slideNumber || this.currentSlideNumber;
    this.currentSlideNumber = targetSlide;
    this.currentSection = `slide_${targetSlide}`;
    this.initAudio();

    if (this.isMusicPlaying && !this.isMuted) {
      this.stopContinuousSounds();
      this.isMusicPlaying = false;
    } else {
      this.isMuted = false;
      this.isMusicPlaying = true;
      if (this.ctx && this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      }
      this.updateSlideAmbience(targetSlide);
    }
    this.notify();
    return this.isMusicPlaying;
  }

  /**
   * Déclenche les sons réalistes narratifs de la page seule
   */
  public toggleRealistic(slideNumber?: number) {
    const targetSlide = slideNumber || this.currentSlideNumber;
    this.currentSlideNumber = targetSlide;
    this.playSlideSoundDesign(targetSlide);
  }

  public getSlideSoundTitle(slideNumber: number): string {
    switch (slideNumber) {
      case 1:
        return "Ouverture : Souffle de l'Atlantique & Thème Cinématique Majestueux";
      case 2:
        return "Rêver & Oser : Balafon Chaleureux & Roulements de Terre Rouge";
      case 3:
        return "Jouer & Rencontrer : Suspense Suspendu & Vibration Tour Vitrée";
      case 4:
        return "Imaginer & Dessiner : Arpèges Néo-Classiques d'Architecte & Trait de Crayon";
      case 5:
        return "Concevoir & Bâtir : Pulsation Horlogère de Précision & Métamorphose 3D";
      case 6:
        return "S'équiper & Frémir : Battement Sourd, Visière Fermée & 5 Feux Rouges FIA";
      case 7:
        return "S'engager & Se Dépasser : Poursuite Plein Gaz, 4 Rapports & Vibreurs";
      case 8:
        return "Rassembler & Vibrer : Polyrythmie Africaine, Fête & Clameur des Tribunes";
      case 9:
        return "Transmettre & S'élever : Coucher de Soleil Océanique, Grue & Relais";
      case 10:
        return "Paddock & Budget : Executive Tech Lounge & Télémétrie Officielle";
      default:
        return "Atmosphère Karting International Bénin";
    }
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Ambience bus
      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(this.ambienceVol, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // --- CONTROLS ---

  public toggleSound(): boolean {
    this.initAudio();
    this.isMuted = !this.isMuted;

    if (this.ctx && this.masterGain) {
      const target = this.isMuted ? 0 : this.masterVol;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.15);
    }

    if (!this.isMuted) {
      this.isMusicPlaying = true;
      this.updateSlideAmbience(this.currentSlideNumber);
    } else {
      this.isMusicPlaying = false;
      this.stopContinuousSounds();
    }

    this.notify();
    return !this.isMuted;
  }

  public stopAll() {
    this.isMuted = true;
    this.isMusicPlaying = false;
    this.isPlayingRealisticFx = false;
    this.stopContinuousSounds();
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.notify();
  }

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
    this.notify();
  }

  public setMusicVolume(val: number) {
    this.musicVol = Math.max(0, Math.min(1, val));
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    }
    this.notify();
  }

  public setAmbienceVolume(val: number) {
    this.ambienceVol = Math.max(0, Math.min(1, val));
    if (this.ctx && this.ambienceGain) {
      this.ambienceGain.gain.setValueAtTime(this.ambienceVol, this.ctx.currentTime);
    }
    this.notify();
  }

  public setSfxVolume(val: number) {
    this.sfxVol = Math.max(0, Math.min(1, val));
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    }
    this.notify();
  }

  // --- COMPOSITION MUSICALE VARIÉE POUR CHACUNE DES 10 PAGES (APPROCHE A) ---

  public updateSlideAmbience(slideNumber: number) {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.ctx) return;

    // Smooth fade-out of previous continuous music
    this.stopContinuousSounds();

    switch (slideNumber) {
      case 1:
        // SLIDE 01 : OUVERTURE CINÉMATIQUE MAJESTUEUSE & SOUFFLE OCÉANIQUE
        this.startSlide01OceanCinematic();
        break;

      case 2:
        // SLIDE 02 (RÊVER · OSER) : BALAFON CHALEUREUX & ROULEMENTS ORGANIQUES
        this.startSlide02BalafonMusic();
        break;

      case 3:
        // SLIDE 03 (JOUER · RENCONTRER) : SUSPENSE FEUTRÉ, BASSE & CRISTAL TOUR VITRÉE
        this.startSlide03SuspenseMusic();
        break;

      case 4:
        // SLIDE 04 (IMAGINER · DESSINER) : ARPÈGES NÉO-CLASSIQUES D'ARCHITECTE
        this.startSlide04ArchitectMinimalism();
        break;

      case 5:
        // SLIDE 05 (CONCEVOIR · BÂTIR) : PULSATION HORLOGÈRE TECHNO-TECHNIQUE
        this.startSlide05EngineeringGroove();
        break;

      case 6:
        // SLIDE 06 (S'ÉQUIPER · FRÉMIR) : DRONE SOURD, BATTEMENT DE CŒUR & PRÉ-GRILLE
        this.startSlide06PaddockTension();
        break;

      case 7:
        // SLIDE 07 (S'ENGAGER · SE DÉPASSER) : CADENCE DE COURSE RYTHMIQUE PLEIN GAZ
        this.startSlide07RaceScreamer();
        break;

      case 8:
        // SLIDE 08 (RASSEMBLER · VIBRER) : POLYRYTHMIE FESTIVE AFRICAINE & CLAMEUR
        this.startSlide08FestivePolyphony();
        break;

      case 9:
        // SLIDE 09 (TRANSMETTRE · S'ÉLEVER) : HARMONIE ÉTHÉRÉE COUCHER DE SOLEIL
        this.startSlide09SunsetElevation();
        break;

      case 10:
        // SLIDE 10 (PADDOCK · BUDGET OFFICIEL) : EXECUTIVE TECH LOUNGE & TÉLÉMÉTRIE
        this.startSlide10ExecutiveLounge();
        break;

      default:
        this.startSlide01OceanCinematic();
        break;
    }
  }

  // --- DÉCLENCHEURS DE SONS RÉALISTES POUR CHAQUE PAGE ---

  public playSlideSoundDesign(slideId: number) {
    this.initAudio();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.isMuted) {
      this.toggleSound();
    }

    this.isPlayingRealisticFx = true;
    this.notify();

    const now = this.ctx.currentTime;

    switch (slideId) {
      case 1:
        this.playSlide01TrailerArc(now);
        break;
      case 2:
        this.playSlide02ReverOser(now);
        break;
      case 3:
        this.playSlide03JouerRencontrer(now);
        break;
      case 4:
        this.playSlide04ImaginerDessiner(now);
        break;
      case 5:
        this.playSlide05ConcevoirBatir(now);
        break;
      case 6:
        this.playSlide06SEquiperFremir(now);
        break;
      case 7:
        this.playContinuousAccelerationSequence();
        break;
      case 8:
        this.playSlide08RassemblerVibrer(now);
        break;
      case 9:
        this.playSlide09TransmettreSElever(now);
        break;
      case 10:
        this.playSlide10BudgetTelemetry(now);
        break;
      default:
        this.playContinuousAccelerationSequence();
        break;
    }

    setTimeout(() => {
      this.isPlayingRealisticFx = false;
      this.notify();
    }, 6500);
  }

  /**
   * Déclenche un des deux effets sonores réalistes spécifiques à la page (superposé à l'ambiance)
   */
  public playSpecificFx(slideId: number, fxIndex: 1 | 2) {
    this.initAudio();
    if (!this.ctx || !this.sfxGain) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.isMuted) {
      this.isMuted = false;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      }
    }

    this.isPlayingRealisticFx = true;
    this.notify();

    const now = this.ctx.currentTime;

    switch (slideId) {
      case 1:
        if (fxIndex === 1) {
          const b = this.createNoiseBufferNode(2.2);
          const f = this.ctx.createBiquadFilter();
          f.type = "bandpass";
          f.frequency.setValueAtTime(320, now);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.18, now + 0.8);
          g.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
          b.connect(f);
          f.connect(g);
          g.connect(this.sfxGain);
          b.start(now);
        } else {
          const r = this.ctx.createOscillator();
          const rg = this.ctx.createGain();
          r.type = "sawtooth";
          r.frequency.setValueAtTime(65, now);
          r.frequency.exponentialRampToValueAtTime(170, now + 1.8);
          rg.gain.setValueAtTime(0.01, now);
          rg.gain.linearRampToValueAtTime(0.18, now + 0.9);
          rg.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
          r.connect(rg);
          rg.connect(this.sfxGain);
          r.start(now);
          r.stop(now + 2.3);
        }
        break;

      case 2:
        if (fxIndex === 1) {
          [0.05, 0.28, 0.55, 0.8].forEach((t, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(360 + i * 80, now + t);
            osc.frequency.exponentialRampToValueAtTime(110, now + t + 0.08);
            gain.gain.setValueAtTime(0.18, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.09);
            osc.connect(gain);
            gain.connect(this.sfxGain!);
            osc.start(now + t);
            osc.stop(now + t + 0.1);
          });
        } else {
          const vroum = this.ctx.createOscillator();
          const vFilter = this.ctx.createBiquadFilter();
          const vGain = this.ctx.createGain();
          vroum.type = "sawtooth";
          vroum.frequency.setValueAtTime(75, now);
          vroum.frequency.exponentialRampToValueAtTime(140, now + 0.6);
          vroum.frequency.exponentialRampToValueAtTime(65, now + 1.2);
          vFilter.type = "lowpass";
          vFilter.frequency.setValueAtTime(260, now);
          vGain.gain.setValueAtTime(0.01, now);
          vGain.gain.linearRampToValueAtTime(0.18, now + 0.5);
          vGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
          vroum.connect(vFilter);
          vFilter.connect(vGain);
          vGain.connect(this.sfxGain);
          vroum.start(now);
          vroum.stop(now + 1.5);
        }
        break;

      case 3:
        if (fxIndex === 1) {
          [0.05, 0.22, 0.4, 0.58, 0.76, 0.94].forEach((t) => {
            const step = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            step.type = "sine";
            step.frequency.setValueAtTime(140, now + t);
            step.frequency.exponentialRampToValueAtTime(45, now + t + 0.07);
            gain.gain.setValueAtTime(0.16, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);
            step.connect(gain);
            gain.connect(this.sfxGain!);
            step.start(now + t);
            step.stop(now + t + 0.09);
          });
        } else {
          const rumble = this.ctx.createOscillator();
          const rGain = this.ctx.createGain();
          rumble.type = "sine";
          rumble.frequency.setValueAtTime(45, now);
          rGain.gain.setValueAtTime(0.01, now);
          rGain.gain.linearRampToValueAtTime(0.24, now + 0.8);
          rGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
          rumble.connect(rGain);
          rGain.connect(this.sfxGain);
          rumble.start(now);
          rumble.stop(now + 2.3);
        }
        break;

      case 4:
        if (fxIndex === 1) {
          const pencil = this.createNoiseBufferNode(1.8);
          const filter = this.ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(2400, now + 1.2);
          const pGain = this.ctx.createGain();
          pGain.gain.setValueAtTime(0.01, now);
          pGain.gain.linearRampToValueAtTime(0.18, now + 0.6);
          pGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          pencil.connect(filter);
          filter.connect(pGain);
          pGain.connect(this.sfxGain);
          pencil.start(now);
        } else {
          [220, 277, 330, 440].forEach((freq) => {
            const chord = this.ctx!.createOscillator();
            const cGain = this.ctx!.createGain();
            chord.type = "sine";
            chord.frequency.setValueAtTime(freq, now);
            cGain.gain.setValueAtTime(0.01, now);
            cGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
            cGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
            chord.connect(cGain);
            cGain.connect(this.sfxGain!);
            chord.start(now);
            chord.stop(now + 2.5);
          });
        }
        break;

      case 5:
        if (fxIndex === 1) {
          [0.05, 0.25, 0.45, 0.65, 0.85, 1.05].forEach((t, i) => {
            const click = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            click.type = "triangle";
            click.frequency.setValueAtTime(850 - i * 50, now + t);
            gain.gain.setValueAtTime(0.14, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05);
            click.connect(gain);
            gain.connect(this.sfxGain!);
            click.start(now + t);
            click.stop(now + t + 0.06);
          });
        } else {
          const engine = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const eGain = this.ctx.createGain();
          engine.type = "sawtooth";
          engine.frequency.setValueAtTime(65, now);
          engine.frequency.exponentialRampToValueAtTime(240, now + 1.5);
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(320, now);
          filter.frequency.exponentialRampToValueAtTime(1100, now + 1.5);
          eGain.gain.setValueAtTime(0.01, now);
          eGain.gain.linearRampToValueAtTime(0.24, now + 0.9);
          eGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
          engine.connect(filter);
          filter.connect(eGain);
          eGain.connect(this.sfxGain);
          engine.start(now);
          engine.stop(now + 2.3);
        }
        break;

      case 6:
        if (fxIndex === 1) {
          [0.05, 0.65].forEach((t) => {
            const hb = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            hb.type = "sine";
            hb.frequency.setValueAtTime(75, now + t);
            hb.frequency.exponentialRampToValueAtTime(35, now + t + 0.12);
            gain.gain.setValueAtTime(0.25, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
            hb.connect(gain);
            gain.connect(this.sfxGain!);
            hb.start(now + t);
            hb.stop(now + t + 0.2);
          });
          const visor = this.ctx.createOscillator();
          const vGain = this.ctx.createGain();
          visor.type = "triangle";
          visor.frequency.setValueAtTime(1300, now + 1.1);
          visor.frequency.exponentialRampToValueAtTime(220, now + 1.18);
          vGain.gain.setValueAtTime(0.22, now + 1.1);
          vGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
          visor.connect(vGain);
          vGain.connect(this.sfxGain);
          visor.start(now + 1.1);
          visor.stop(now + 1.28);
        } else {
          [1, 2, 3, 4, 5].forEach((lightNum, i) => {
            const lightTime = now + i * 0.45;
            const beep = this.ctx!.createOscillator();
            const bGain = this.ctx!.createGain();
            beep.type = "triangle";
            beep.frequency.setValueAtTime(700 + lightNum * 60, lightTime);
            bGain.gain.setValueAtTime(0.24, lightTime);
            bGain.gain.exponentialRampToValueAtTime(0.001, lightTime + 0.16);
            beep.connect(bGain);
            bGain.connect(this.sfxGain!);
            beep.start(lightTime);
            beep.stop(lightTime + 0.18);
          });
        }
        break;

      case 7:
        if (fxIndex === 1) {
          this.playContinuousAccelerationSequence();
        } else {
          this.playDopplerPassBy();
        }
        break;

      case 8:
        if (fxIndex === 1) {
          [0.0, 0.25, 0.5, 0.75, 1.0, 1.25].forEach((t, i) => {
            const drum = this.ctx!.createOscillator();
            const dGain = this.ctx!.createGain();
            drum.type = "sine";
            drum.frequency.setValueAtTime(i % 2 === 0 ? 115 : 85, now + t);
            drum.frequency.exponentialRampToValueAtTime(35, now + t + 0.14);
            dGain.gain.setValueAtTime(0.22, now + t);
            dGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.16);
            drum.connect(dGain);
            dGain.connect(this.sfxGain!);
            drum.start(now + t);
            drum.stop(now + t + 0.18);
          });
        } else {
          const sub = this.ctx.createOscillator();
          const sGain = this.ctx.createGain();
          sub.type = "sine";
          sub.frequency.setValueAtTime(38, now);
          sGain.gain.setValueAtTime(0.01, now);
          sGain.gain.linearRampToValueAtTime(0.26, now + 0.8);
          sGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
          sub.connect(sGain);
          sGain.connect(this.sfxGain);
          sub.start(now);
          sub.stop(now + 2.5);
        }
        break;

      case 9:
        if (fxIndex === 1) {
          const engine = this.ctx.createOscillator();
          const eGain = this.ctx.createGain();
          engine.type = "sawtooth";
          engine.frequency.setValueAtTime(140, now);
          engine.frequency.exponentialRampToValueAtTime(45, now + 1.5);
          eGain.gain.setValueAtTime(0.18, now);
          eGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          engine.connect(eGain);
          eGain.connect(this.sfxGain);
          engine.start(now);
          engine.stop(now + 1.9);
        } else {
          [164.81, 220, 261.63, 329.63].forEach((f, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now + i * 0.1);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
            osc.connect(gain);
            gain.connect(this.sfxGain!);
            osc.start(now + i * 0.1);
            osc.stop(now + 3.4);
          });
        }
        break;

      case 10:
        if (fxIndex === 1) {
          [0.05, 0.25, 0.5, 0.75, 1.0].forEach((t, i) => {
            const blip = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            blip.type = "triangle";
            blip.frequency.setValueAtTime(1200 + (i % 3) * 350, now + t);
            gain.gain.setValueAtTime(0.14, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);
            blip.connect(gain);
            gain.connect(this.sfxGain!);
            blip.start(now + t);
            blip.stop(now + t + 0.09);
          });
        } else {
          [196, 246.94, 293.66, 369.99].forEach((f) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.09, now + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
            osc.connect(gain);
            gain.connect(this.sfxGain!);
            osc.start(now);
            osc.stop(now + 2.6);
          });
        }
        break;
    }

    setTimeout(() => {
      this.isPlayingRealisticFx = false;
      this.notify();
    }, 2800);
  }

  // =========================================================================
  // 10 COMPOSITIONS MUSICALES CONTINUES (PROCÉDURALES HAUTE FIDÉLITÉ)
  // =========================================================================

  /**
   * SLIDE 01 : Souffle de l'océan Atlantique & Accords cinématiques amples (Am9 -> Fmaj7 -> C)
   */
  private startSlide01OceanCinematic() {
    this.startWindAmbience(220, 0.09);
    // Deep noble sub drone (55 Hz - A1)
    this.createDroneOscillator(55, 0.12, "triangle");
    
    // Warm cinematic chord cycle
    const chords = [
      [220, 261.63, 329.63, 493.88], // Am9
      [174.61, 261.63, 329.63, 440],  // Fmaj7
      [196, 261.63, 329.63, 392],     // Cmaj
      [196, 246.94, 293.66, 440],     // Gsus2
    ];
    let chordIdx = 0;

    const playNextChord = () => {
      if (this.currentSlideNumber !== 1 || this.isMuted) return;
      this.crossfadeChord(chords[chordIdx], 3.8, 0.08);
      chordIdx = (chordIdx + 1) % chords.length;
    };

    playNextChord();
    const interval = window.setInterval(playNextChord, 4000);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 02 : Mélodie au Balafon / Marimba africain chaleureux & percussions boisées
   */
  private startSlide02BalafonMusic() {
    // Warm sunshine pad (D major)
    this.createDroneOscillator(73.42, 0.09, "sine"); // D2
    this.startGentlePad([293.66, 369.99, 440], 0.06); // D, F#, A

    // Balafon pentatonic arpeggio sequence (D, E, F#, A, B, D5)
    const scale = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
    const melody = [0, 2, 4, 3, 1, 3, 5, 4, 2, 1, 0, 2];
    let step = 0;

    const tickBalafon = () => {
      if (this.currentSlideNumber !== 2 || this.isMuted || !this.ctx || !this.musicGain) return;
      const noteFreq = scale[melody[step % melody.length]];
      step++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(noteFreq, now);

      // Wooden percussive attack with quick warm decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.5);
    };

    const interval = window.setInterval(tickBalafon, 360);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 03 : Suspense cinématographique feutré, pulsation basse et tintement de verre
   */
  private startSlide03SuspenseMusic() {
    // Low E minor drone with slight modulation
    this.createDroneOscillator(82.41, 0.12, "triangle"); // E2
    this.startGentlePad([164.81, 196.00, 246.94], 0.07); // E3, G3, B3

    // High crystalline glass shimmer tone (architect's glass tower)
    const shimmer = this.ctx?.createOscillator();
    const sGain = this.ctx?.createGain();
    if (this.ctx && this.musicGain && shimmer && sGain) {
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(1318.51, this.ctx.currentTime); // E6
      sGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      shimmer.connect(sGain);
      sGain.connect(this.musicGain);
      shimmer.start();
      this.activeMusicOscs.push(shimmer);
      this.activeMusicGains.push(sGain);
    }

    // Steady rhythmic tension heartbeat (every 1.4s)
    const tickSuspense = () => {
      if (this.currentSlideNumber !== 3 || this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const pulse = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();
      pulse.type = "sine";
      pulse.frequency.setValueAtTime(55, now);
      pulse.frequency.exponentialRampToValueAtTime(35, now + 0.15);
      pGain.gain.setValueAtTime(0.12, now);
      pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      pulse.connect(pGain);
      pGain.connect(this.musicGain);
      pulse.start(now);
      pulse.stop(now + 0.22);
    };

    const interval = window.setInterval(tickSuspense, 1400);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 04 : Arpèges néo-classiques d'architecte (style Philip Glass / Max Richter)
   */
  private startSlide04ArchitectMinimalism() {
    // Minimalist rolling piano pattern in A minor (A3, C4, E4, B3, D4)
    this.createDroneOscillator(110, 0.06, "sine"); // A2

    const pattern = [220, 261.63, 329.63, 246.94, 293.66, 329.63, 392, 329.63];
    let noteIdx = 0;

    const playMinimalistArp = () => {
      if (this.currentSlideNumber !== 4 || this.isMuted || !this.ctx || !this.musicGain) return;
      const freq = pattern[noteIdx % pattern.length];
      noteIdx++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.6);
    };

    const interval = window.setInterval(playMinimalistArp, 280);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 05 : Pulsation horlogère de précision & Groove techno-technique
   */
  private startSlide05EngineeringGroove() {
    // Steady technical low sub pulse
    this.createDroneOscillator(65.41, 0.1, "sawtooth"); // C2 lowpass

    // Modern chord swell (Cm7 -> Abmaj7)
    this.startGentlePad([261.63, 311.13, 392, 466.16], 0.07);

    // Precision clockwork click (120 BPM)
    let beat = 0;
    const tickClockwork = () => {
      if (this.currentSlideNumber !== 5 || this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const click = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      click.type = beat % 4 === 0 ? "triangle" : "sine";
      click.frequency.setValueAtTime(beat % 4 === 0 ? 1200 : 800, now);
      click.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(beat % 4 === 0 ? 0.08 : 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      click.connect(gain);
      gain.connect(this.musicGain);

      click.start(now);
      click.stop(now + 0.06);
      beat++;
    };

    const interval = window.setInterval(tickClockwork, 250);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 06 : Battement sourd de pré-grille, étouffé comme sous un casque fermé
   */
  private startSlide06PaddockTension() {
    // Helmet interior muffled low rumble
    this.startDistantEngine(50, 0.07);

    // Suspense high string drone
    this.startGentlePad([440, 554.37], 0.04); // A4, C#5 high tension

    // Heartbeat pulse dub-dub (72 BPM)
    const tickHeartbeat = () => {
      if (this.currentSlideNumber !== 6 || this.isMuted || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      // Dub 1
      const osc1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(70, now);
      osc1.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      g1.gain.setValueAtTime(0.18, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(g1);
      g1.connect(this.musicGain);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Dub 2
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(60, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(35, now + 0.3);
      g2.gain.setValueAtTime(0.12, now + 0.18);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(g2);
      g2.connect(this.musicGain);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.33);
    };

    const interval = window.setInterval(tickHeartbeat, 1100);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 07 : Cadence de course survoltée & énergie mécanique plein gaz
   */
  private startSlide07RaceScreamer() {
    // Fast rolling 16th-note bassline in F# minor
    const bassNotes = [92.5, 92.5, 110, 92.5, 123.47, 92.5, 110, 82.41];
    let step = 0;

    const tickRaceBass = () => {
      if (this.currentSlideNumber !== 7 || this.isMuted || !this.ctx || !this.musicGain) return;
      const freq = bassNotes[step % bassNotes.length];
      step++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.18);
    };

    const interval = window.setInterval(tickRaceBass, 175);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 08 : Polyrythmie festive africaine & clameur des tribunes
   */
  private startSlide08FestivePolyphony() {
    // Uplifting warm brass chords (G major / C major)
    this.startGentlePad([196, 246.94, 293.66, 392], 0.07);

    // African Djembe / drum syncopation pattern
    const drumPitches = [110, 75, 130, 85, 110, 85, 140, 75];
    let dStep = 0;

    const tickAfricanDrum = () => {
      if (this.currentSlideNumber !== 8 || this.isMuted || !this.ctx || !this.musicGain) return;
      const pitch = drumPitches[dStep % drumPitches.length];
      dStep++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.16);
    };

    const interval = window.setInterval(tickAfricanDrum, 240);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 09 : Élévation émotionnelle, coucher de soleil doré sur l'océan
   */
  private startSlide09SunsetElevation() {
    this.startWindAmbience(180, 0.06);

    // Noble emotional progression: Fmaj7 -> G -> Am -> Em9
    const chords = [
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [196, 246.94, 293.66, 392],    // G
      [220, 261.63, 329.63, 440],    // Am
      [164.81, 246.94, 329.63, 392], // Em
    ];
    let cIdx = 0;

    const playSunsetProgression = () => {
      if (this.currentSlideNumber !== 9 || this.isMuted) return;
      this.crossfadeChord(chords[cIdx], 4.2, 0.08);
      cIdx = (cIdx + 1) % chords.length;
    };

    playSunsetProgression();
    const interval = window.setInterval(playSunsetProgression, 4500);
    this.activeIntervals.push(interval);
  }

  /**
   * SLIDE 10 : Executive Tech Lounge & Télémétrie officielle (Page Budget & Paddock)
   * Musique chic, moderne, feutrée reflétant le sérieux d'un appel d'offres de prestige
   */
  private startSlide10ExecutiveLounge() {
    // Warm jazz/lo-fi electric piano chords (Dm9 -> G13 -> Cmaj9 -> Am7)
    this.createDroneOscillator(73.42, 0.08, "sine"); // D2 deep sub

    const loungeChords = [
      [293.66, 349.23, 440, 523.25, 659.25], // Dm9 (D, F, A, C, E)
      [196, 246.94, 329.63, 440],            // G13 (G, B, E, A)
      [261.63, 329.63, 392, 493.88],         // Cmaj9 (C, E, G, B)
      [220, 261.63, 329.63, 440],            // Am7 (A, C, E, G)
    ];
    let lIdx = 0;

    const playLoungeChords = () => {
      if (this.currentSlideNumber !== 10 || this.isMuted) return;
      this.crossfadeChord(loungeChords[lIdx], 3.8, 0.07);
      lIdx = (lIdx + 1) % loungeChords.length;
    };

    playLoungeChords();
    const interval1 = window.setInterval(playLoungeChords, 4000);
    this.activeIntervals.push(interval1);

    // Subtle high-tech telemetry blip / electronic pulse (like timing telemetry screens)
    let tBeat = 0;
    const tickTelemetry = () => {
      if (this.currentSlideNumber !== 10 || this.isMuted || !this.ctx || !this.musicGain) return;
      tBeat++;
      if (tBeat % 3 !== 0) return; // occasional crisp telemetry accent

      const now = this.ctx.currentTime;
      const blip = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      blip.type = "sine";
      blip.frequency.setValueAtTime(1760 + (tBeat % 2) * 220, now); // A6
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      blip.connect(gain);
      gain.connect(this.musicGain);

      blip.start(now);
      blip.stop(now + 0.09);
    };

    const interval2 = window.setInterval(tickTelemetry, 800);
    this.activeIntervals.push(interval2);
  }

  // =========================================================================
  // SONS RÉALISTES CINÉMATOGRAPHIQUES DÉDIÉS
  // =========================================================================

  private playSlide01TrailerArc(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // 1. Souffle océanique ample
    const breath = this.createNoiseBufferNode(1.4);
    const bFilter = this.ctx.createBiquadFilter();
    bFilter.type = "bandpass";
    bFilter.frequency.setValueAtTime(380, now);
    const bGain = this.ctx.createGain();
    bGain.gain.setValueAtTime(0.001, now);
    bGain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    breath.connect(bFilter);
    bFilter.connect(bGain);
    bGain.connect(this.sfxGain);
    breath.start(now);

    // 2. Grondement de kart lointain à 1.4s
    const rumble = this.ctx.createOscillator();
    const rGain = this.ctx.createGain();
    rumble.type = "sawtooth";
    rumble.frequency.setValueAtTime(60, now + 1.4);
    rumble.frequency.exponentialRampToValueAtTime(160, now + 2.8);
    rGain.gain.setValueAtTime(0.001, now + 1.4);
    rGain.gain.linearRampToValueAtTime(0.16, now + 2.2);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
    rumble.connect(rGain);
    rGain.connect(this.sfxGain);
    rumble.start(now + 1.4);
    rumble.stop(now + 3.3);

    // 3. Montée en puissance
    setTimeout(() => {
      this.playContinuousAccelerationSequence();
    }, 3200);
  }

  private playSlide02ReverOser(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Bruits de bois artisanal assemblé avec ficelle
    [0.1, 0.35, 0.65, 0.95].forEach((t, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(380 + i * 90, now + t);
      osc.frequency.exponentialRampToValueAtTime(110, now + t + 0.08);
      gain.gain.setValueAtTime(0.16, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + t);
      osc.stop(now + t + 0.1);
    });

    // Sifflement des roues sur la terre rouge
    const whistle = this.ctx.createOscillator();
    const wGain = this.ctx.createGain();
    whistle.type = "triangle";
    whistle.frequency.setValueAtTime(480, now + 1.2);
    whistle.frequency.exponentialRampToValueAtTime(920, now + 2.2);
    wGain.gain.setValueAtTime(0.001, now + 1.2);
    wGain.gain.linearRampToValueAtTime(0.08, now + 1.7);
    wGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    whistle.connect(wGain);
    wGain.connect(this.sfxGain);
    whistle.start(now + 1.2);
    whistle.stop(now + 2.5);

    // Murmure enfantin innocent "vroum-vroum" à 2.6s
    const vroum = this.ctx.createOscillator();
    const vFilter = this.ctx.createBiquadFilter();
    const vGain = this.ctx.createGain();
    vroum.type = "sawtooth";
    vroum.frequency.setValueAtTime(75, now + 2.6);
    vroum.frequency.exponentialRampToValueAtTime(140, now + 3.1);
    vroum.frequency.exponentialRampToValueAtTime(65, now + 3.6);
    vFilter.type = "lowpass";
    vFilter.frequency.setValueAtTime(260, now + 2.6);
    vGain.gain.setValueAtTime(0.001, now + 2.6);
    vGain.gain.linearRampToValueAtTime(0.14, now + 2.9);
    vGain.gain.exponentialRampToValueAtTime(0.001, now + 3.7);
    vroum.connect(vFilter);
    vFilter.connect(vGain);
    vGain.connect(this.sfxGain);
    vroum.start(now + 2.6);
    vroum.stop(now + 3.8);
  }

  private playSlide03JouerRencontrer(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Pas rythmés de course dans la poussière
    [0.1, 0.3, 0.5, 0.7, 0.9, 1.1].forEach((t) => {
      const step = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      step.type = "sine";
      step.frequency.setValueAtTime(130, now + t);
      step.frequency.exponentialRampToValueAtTime(45, now + t + 0.07);
      gain.gain.setValueAtTime(0.12, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);
      step.connect(gain);
      gain.connect(this.sfxGain!);
      step.start(now + t);
      step.stop(now + t + 0.09);
    });

    // Arrêt net puis onde tellurique à 1.6s
    const rumble = this.ctx.createOscillator();
    const rGain = this.ctx.createGain();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(42, now + 1.6);
    rGain.gain.setValueAtTime(0.001, now + 1.6);
    rGain.gain.linearRampToValueAtTime(0.18, now + 2.5);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);
    rumble.connect(rGain);
    rGain.connect(this.sfxGain);
    rumble.start(now + 1.6);
    rumble.stop(now + 4.0);

    // Tintement de tasse en porcelaine sur le bureau de l'architecte
    [2.1, 2.35, 2.6, 2.85].forEach((t) => {
      const chink = this.ctx!.createOscillator();
      const cGain = this.ctx!.createGain();
      chink.type = "triangle";
      chink.frequency.setValueAtTime(2400, now + t);
      cGain.gain.setValueAtTime(0.05, now + t);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.04);
      chink.connect(cGain);
      cGain.connect(this.sfxGain!);
      chink.start(now + t);
      chink.stop(now + t + 0.05);
    });
  }

  private playSlide04ImaginerDessiner(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Crayon graphite montant en fréquence comme un régime moteur
    const pencil = this.createNoiseBufferNode(2.5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 1.8);
    filter.frequency.exponentialRampToValueAtTime(1000, now + 2.4);
    const pGain = this.ctx.createGain();
    pGain.gain.setValueAtTime(0.001, now);
    pGain.gain.linearRampToValueAtTime(0.15, now + 0.8);
    pGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    pencil.connect(filter);
    filter.connect(pGain);
    pGain.connect(this.sfxGain);
    pencil.start(now);

    // Accords calmes d'inspiration
    [220, 277, 330, 440].forEach((freq) => {
      const chord = this.ctx!.createOscillator();
      const cGain = this.ctx!.createGain();
      chord.type = "sine";
      chord.frequency.setValueAtTime(freq, now + 0.2);
      cGain.gain.setValueAtTime(0.001, now + 0.2);
      cGain.gain.linearRampToValueAtTime(0.05, now + 1.0);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      chord.connect(cGain);
      cGain.connect(this.sfxGain!);
      chord.start(now + 0.2);
      chord.stop(now + 3.2);
    });
  }

  private playSlide05ConcevoirBatir(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // 1. Clics et engrenages d'horlogerie de précision
    [0.1, 0.35, 0.6, 0.85, 1.1, 1.35].forEach((t, i) => {
      const click = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      click.type = "triangle";
      click.frequency.setValueAtTime(850 - i * 60, now + t);
      gain.gain.setValueAtTime(0.1, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05);
      click.connect(gain);
      gain.connect(this.sfxGain!);
      click.start(now + t);
      click.stop(now + t + 0.06);
    });

    // 2. Kart miniature sur le diorama
    const toy = this.ctx.createOscillator();
    const tGain = this.ctx.createGain();
    toy.type = "sawtooth";
    toy.frequency.setValueAtTime(110, now + 1.5);
    toy.frequency.exponentialRampToValueAtTime(180, now + 2.2);
    tGain.gain.setValueAtTime(0.001, now + 1.5);
    tGain.gain.linearRampToValueAtTime(0.08, now + 1.9);
    toy.connect(tGain);
    tGain.connect(this.sfxGain);
    toy.start(now + 1.5);
    toy.stop(now + 2.3);

    // 3. Métamorphose spectaculaire en moteur réel
    const engine = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const eGain = this.ctx.createGain();
    engine.type = "sawtooth";
    engine.frequency.setValueAtTime(65, now + 2.4);
    engine.frequency.exponentialRampToValueAtTime(240, now + 3.8);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now + 2.4);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 3.8);
    eGain.gain.setValueAtTime(0.01, now + 2.4);
    eGain.gain.linearRampToValueAtTime(0.25, now + 3.4);
    eGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
    engine.connect(filter);
    filter.connect(eGain);
    eGain.connect(this.sfxGain);
    engine.start(now + 2.4);
    engine.stop(now + 4.6);
  }

  private playSlide06SEquiperFremir(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // 1. Deux battements de cœur puissants
    [0.1, 0.8].forEach((t) => {
      const hb = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      hb.type = "sine";
      hb.frequency.setValueAtTime(75, now + t);
      hb.frequency.exponentialRampToValueAtTime(35, now + t + 0.12);
      gain.gain.setValueAtTime(0.22, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
      hb.connect(gain);
      gain.connect(this.sfxGain!);
      hb.start(now + t);
      hb.stop(now + t + 0.2);
    });

    // 2. Claquement sec de la visière du casque à 1.4s
    const visor = this.ctx.createOscillator();
    const vGain = this.ctx.createGain();
    visor.type = "triangle";
    visor.frequency.setValueAtTime(1300, now + 1.4);
    visor.frequency.exponentialRampToValueAtTime(220, now + 1.48);
    vGain.gain.setValueAtTime(0.2, now + 1.4);
    vGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    visor.connect(vGain);
    vGain.connect(this.sfxGain);
    visor.start(now + 1.4);
    visor.stop(now + 1.52);

    // 3. Deux coups d'accélérateur francs
    [
      { t: 1.8, dur: 0.45, startF: 90, endF: 230 },
      { t: 2.6, dur: 0.65, startF: 95, endF: 310 },
    ].forEach((b) => {
      const rev = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      rev.type = "sawtooth";
      rev.frequency.setValueAtTime(b.startF, now + b.t);
      rev.frequency.exponentialRampToValueAtTime(b.endF, now + b.t + b.dur * 0.7);
      rev.frequency.exponentialRampToValueAtTime(b.startF, now + b.t + b.dur);
      gain.gain.setValueAtTime(0.01, now + b.t);
      gain.gain.linearRampToValueAtTime(0.22, now + b.t + b.dur * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + b.t + b.dur);
      rev.connect(gain);
      gain.connect(this.sfxGain!);
      rev.start(now + b.t);
      rev.stop(now + b.t + b.dur + 0.05);
    });

    // 4. Séquence des 5 feux rouges FIA
    [1, 2, 3, 4, 5].forEach((lightNum, i) => {
      const lightTime = now + 3.6 + i * 0.7;
      const beep = this.ctx!.createOscillator();
      const bGain = this.ctx!.createGain();
      beep.type = "triangle";
      beep.frequency.setValueAtTime(700 + lightNum * 60, lightTime);
      bGain.gain.setValueAtTime(0.22, lightTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, lightTime + 0.16);
      beep.connect(bGain);
      bGain.connect(this.sfxGain!);
      beep.start(lightTime);
      beep.stop(lightTime + 0.18);
    });
  }

  private playSlide08RassemblerVibrer(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // 1. Percussions amples de célébration
    [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].forEach((t, i) => {
      const drum = this.ctx!.createOscillator();
      const dGain = this.ctx!.createGain();
      drum.type = "sine";
      const f = i % 2 === 0 ? 115 : 85;
      drum.frequency.setValueAtTime(f, now + t);
      drum.frequency.exponentialRampToValueAtTime(35, now + t + 0.14);
      dGain.gain.setValueAtTime(0.2, now + t);
      dGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.16);
      drum.connect(dGain);
      dGain.connect(this.sfxGain!);
      drum.start(now + t);
      drum.stop(now + t + 0.18);
    });

    // 2. Basse tellurique qui fait trembler les barrières (36 Hz)
    const sub = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(36, now);
    sGain.gain.setValueAtTime(0.01, now);
    sGain.gain.linearRampToValueAtTime(0.25, now + 1.2);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
    sub.connect(sGain);
    sGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 3.2);

    // 3. Passage Doppler en arrière-plan
    this.playDopplerPassBy();
  }

  private playSlide09TransmettreSElever(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // 1. Moteur qui rentre au stand et coupe le contact
    const engine = this.ctx.createOscillator();
    const eGain = this.ctx.createGain();
    engine.type = "sawtooth";
    engine.frequency.setValueAtTime(140, now);
    engine.frequency.exponentialRampToValueAtTime(65, now + 1.5);
    engine.frequency.setValueAtTime(45, now + 1.8);
    eGain.gain.setValueAtTime(0.16, now);
    eGain.gain.linearRampToValueAtTime(0.08, now + 1.5);
    eGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    engine.connect(eGain);
    eGain.connect(this.sfxGain);
    engine.start(now);
    engine.stop(now + 2.05);

    // 2. Nappe aérienne ascendante (montée de grue au coucher de soleil)
    [261, 329, 392, 523].forEach((f) => {
      const ethereal = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      ethereal.type = "sine";
      ethereal.frequency.setValueAtTime(f, now + 2.0);
      ethereal.frequency.exponentialRampToValueAtTime(f * 1.05, now + 4.0);
      gain.gain.setValueAtTime(0.001, now + 2.0);
      gain.gain.linearRampToValueAtTime(0.07, now + 3.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);
      ethereal.connect(gain);
      gain.connect(this.sfxGain!);
      ethereal.start(now + 2.0);
      ethereal.stop(now + 5.0);
    });

    // 3. Murmure d'enfant nostalgique "vroum" à 4.2s (la boucle est bouclée)
    const childVroum = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    childVroum.type = "triangle";
    childVroum.frequency.setValueAtTime(95, now + 4.2);
    childVroum.frequency.exponentialRampToValueAtTime(160, now + 4.6);
    childVroum.frequency.exponentialRampToValueAtTime(75, now + 5.1);
    cGain.gain.setValueAtTime(0.001, now + 4.2);
    cGain.gain.linearRampToValueAtTime(0.15, now + 4.5);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 5.2);
    childVroum.connect(cGain);
    cGain.connect(this.sfxGain);
    childVroum.start(now + 4.2);
    childVroum.stop(now + 5.3);
  }

  /**
   * SLIDE 10 : Design sonore réaliste Paddock & Télémétrie Officielle
   */
  private playSlide10BudgetTelemetry(now: number) {
    if (!this.ctx || !this.sfxGain) return;
    // 1. Télémétrie électronique officielle FIA (bips de synchronisation des temps au tour)
    [0.1, 0.4, 0.7, 1.2, 1.5, 2.0].forEach((t, i) => {
      const blip = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      blip.type = "sine";
      blip.frequency.setValueAtTime(1200 + (i % 3) * 300, now + t);
      gain.gain.setValueAtTime(0.08, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);
      blip.connect(gain);
      gain.connect(this.sfxGain!);
      blip.start(now + t);
      blip.stop(now + t + 0.09);
    });

    // 2. Chuchotement feutré de paddock & ambiance lounge VIP
    const loungePad = this.ctx.createOscillator();
    const lGain = this.ctx.createGain();
    loungePad.type = "sine";
    loungePad.frequency.setValueAtTime(220, now + 0.5);
    loungePad.frequency.linearRampToValueAtTime(261.63, now + 2.5);
    lGain.gain.setValueAtTime(0.001, now + 0.5);
    lGain.gain.linearRampToValueAtTime(0.06, now + 1.8);
    lGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);
    loungePad.connect(lGain);
    lGain.connect(this.sfxGain);
    loungePad.start(now + 0.5);
    loungePad.stop(now + 4.0);

    // 3. Validation sonore officielle (accord noble de confirmation du budget)
    [329.63, 392, 493.88, 587.33].forEach((f, idx) => {
      const conf = this.ctx!.createOscillator();
      const cGain = this.ctx!.createGain();
      conf.type = "triangle";
      conf.frequency.setValueAtTime(f, now + 2.2 + idx * 0.06);
      cGain.gain.setValueAtTime(0.001, now + 2.2 + idx * 0.06);
      cGain.gain.linearRampToValueAtTime(0.06, now + 2.4);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);
      conf.connect(cGain);
      cGain.connect(this.sfxGain!);
      conf.start(now + 2.2 + idx * 0.06);
      conf.stop(now + 4.5);
    });
  }

  // =========================================================================
  // MÉTHODES UTILITAIRES ET EFFETS PARTAGÉS
  // =========================================================================

  public playContinuousAccelerationSequence() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const sub = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      sub.type = "triangle";
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, now);

      // Rapport 1
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 1.1);
      sub.frequency.setValueAtTime(37, now);
      sub.frequency.exponentialRampToValueAtTime(90, now + 1.1);
      filter.frequency.exponentialRampToValueAtTime(900, now + 1.1);

      // Rapport 2
      osc.frequency.setValueAtTime(110, now + 1.25);
      sub.frequency.setValueAtTime(55, now + 1.25);
      osc.frequency.exponentialRampToValueAtTime(260, now + 2.7);
      sub.frequency.exponentialRampToValueAtTime(130, now + 2.7);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 2.7);

      // Rapport 3
      osc.frequency.setValueAtTime(170, now + 2.85);
      sub.frequency.setValueAtTime(85, now + 2.85);
      osc.frequency.exponentialRampToValueAtTime(360, now + 4.5);
      sub.frequency.exponentialRampToValueAtTime(180, now + 4.5);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 4.5);

      // Rapport 4 (pleine vitesse)
      osc.frequency.setValueAtTime(250, now + 4.6);
      osc.frequency.exponentialRampToValueAtTime(440, now + 6.2);
      sub.frequency.setValueAtTime(125, now + 4.6);
      sub.frequency.exponentialRampToValueAtTime(220, now + 6.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.8);
      gain.gain.setValueAtTime(0.18, now + 1.15);
      gain.gain.linearRampToValueAtTime(0.28, now + 2.4);
      gain.gain.setValueAtTime(0.20, now + 2.75);
      gain.gain.linearRampToValueAtTime(0.32, now + 4.4);
      gain.gain.linearRampToValueAtTime(0.35, now + 5.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 6.8);

      osc.connect(filter);
      sub.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 6.9);
      sub.stop(now + 6.9);
    } catch {
      // Audio fallback
    }
  }

  public playDopplerPassBy() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.9);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Ignore
    }
  }

  public playCountdownStep(stepIndex: number) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(580 + stepIndex * 60, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  public playGreenLightLaunch() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = "sine";
      bell.frequency.setValueAtTime(1200, now);
      bellGain.gain.setValueAtTime(0.35, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      bell.connect(bellGain);
      bellGain.connect(this.sfxGain);
      bell.start(now);
      bell.stop(now + 0.85);
    } catch {
      // Ignore
    }
  }

  public updateSectionSound(sectionId: string) {
    this.currentSection = sectionId;
    this.notify();
  }

  private startGentlePad(freqs: number[], vol = 0.07) {
    if (!this.ctx || !this.musicGain) return;
    try {
      freqs.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
        gain.gain.setValueAtTime(vol / freqs.length, this.ctx!.currentTime);
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start();
        this.activeMusicOscs.push(osc);
        this.activeMusicGains.push(gain);
      });
    } catch {
      // Ignore
    }
  }

  private createDroneOscillator(freq: number, vol = 0.08, type: OscillatorType = "sine") {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();
      this.activeMusicOscs.push(osc);
      this.activeMusicGains.push(gain);
    } catch {
      // Ignore
    }
  }

  private crossfadeChord(freqs: number[], duration = 3.8, vol = 0.08) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const now = this.ctx.currentTime;
      freqs.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol / freqs.length, now + 1.2);
        gain.gain.setValueAtTime(vol / freqs.length, now + duration - 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  private startDistantEngine(freq = 110, volume = 0.04) {
    if (!this.ctx || !this.ambienceGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(240, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start();
      this.activeAmbienceNodes.push(osc);
    } catch {
      // Ignore
    }
  }

  private startWindAmbience(cutoff = 220, gainVal = 0.06) {
    if (!this.ctx || !this.ambienceGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambienceGain);

      noise.start();
      this.activeAmbienceNodes.push(noise);
    } catch {
      // Ignore
    }
  }

  private createNoiseBufferNode(durationSeconds: number): AudioBufferSourceNode {
    const bufferSize = Math.max(1, Math.floor((this.ctx?.sampleRate || 44100) * durationSeconds));
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx!.createBufferSource();
    whiteNoise.buffer = buffer;
    return whiteNoise;
  }

  private stopContinuousSounds() {
    this.activeIntervals.forEach((id) => clearInterval(id));
    this.activeIntervals = [];

    this.activeMusicOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // Ignore
      }
    });
    this.activeMusicOscs = [];
    this.activeMusicGains = [];

    this.activeAmbienceNodes.forEach((node) => {
      try {
        (node as AudioScheduledSourceNode).stop();
      } catch {
        // Ignore
      }
    });
    this.activeAmbienceNodes = [];
  }
}

export const audioSystem = new CinematicAudioSystem();
