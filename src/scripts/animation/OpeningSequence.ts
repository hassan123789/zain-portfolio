// OpeningSequence - 波が生まれる瞬間
// 無から存在へ。あなたの物語の始まり。

import gsap from 'gsap';

interface OpeningOptions {
  onComplete?: () => void;
}

export class OpeningSequence {
  private overlay: HTMLElement;
  private loader: HTMLElement;
  private text: HTMLElement;
  private timeline: gsap.core.Timeline;

  constructor(options: OpeningOptions = {}) {
    this.overlay = this.createOverlay();
    this.loader = this.createLoader();
    this.text = this.createText();

    this.overlay.appendChild(this.loader);
    this.overlay.appendChild(this.text);
    document.body.appendChild(this.overlay);

    this.timeline = gsap.timeline({
      onComplete: () => {
        this.destroy();
        options.onComplete?.();
      }
    });

    this.play();
  }

  private createOverlay(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'opening-overlay';
    el.style.cssText = `
      position: fixed;
      inset: 0;
      background: #0a0a0f;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `;
    return el;
  }

  private createLoader(): HTMLElement {
    const el = document.createElement('div');
    el.innerHTML = `
      <svg width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7d3cef;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle class="pulse-ring" cx="60" cy="60" r="50"
          fill="none" stroke="url(#wave-gradient)" stroke-width="2" opacity="0.3"/>
        <circle class="pulse-ring-2" cx="60" cy="60" r="40"
          fill="none" stroke="url(#wave-gradient)" stroke-width="1" opacity="0.2"/>
        <circle class="core" cx="60" cy="60" r="8" fill="url(#wave-gradient)"/>
        <path class="wave-path" d="M20,60 Q40,40 60,60 T100,60"
          fill="none" stroke="url(#wave-gradient)" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    el.style.cssText = `
      opacity: 0;
      transform: scale(0.5);
    `;
    return el;
  }

  private createText(): HTMLElement {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="opening-line" style="overflow: hidden; height: 1.5em;">
        <span style="display: block; transform: translateY(100%);">Action</span>
      </div>
      <div class="opening-line" style="overflow: hidden; height: 1.5em; opacity: 0.7;">
        <span style="display: block; transform: translateY(100%);">= f(Survival of Identity)</span>
      </div>
    `;
    el.style.cssText = `
      font-family: 'JetBrains Mono', monospace;
      font-size: clamp(1rem, 3vw, 1.5rem);
      color: #f0f0f5;
      text-align: center;
      margin-top: 2rem;
    `;
    return el;
  }

  private play(): void {
    const pulseRings = this.loader.querySelectorAll('.pulse-ring, .pulse-ring-2');
    const core = this.loader.querySelector('.core');
    const wavePath = this.loader.querySelector('.wave-path');
    const textLines = this.text.querySelectorAll('.opening-line span');

    this.timeline
      // Phase 1: Core appears
      .to(this.loader, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out'
      })

      // Phase 2: Core pulses
      .to(core, {
        scale: 1.5,
        duration: 0.4,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 2
      })

      // Phase 3: Rings expand
      .to(pulseRings, {
        scale: 1.5,
        opacity: 0.8,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1
      }, '-=0.5')

      // Phase 4: Wave animates
      .fromTo(wavePath,
        { strokeDasharray: '200', strokeDashoffset: '200' },
        { strokeDashoffset: '0', duration: 1, ease: 'power2.inOut' }
      , '-=0.3')

      // Phase 5: Text reveals
      .to(textLines, {
        y: '0%',
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2
      }, '-=0.5')

      // Phase 6: Hold
      .to({}, { duration: 0.5 })

      // Phase 7: Everything fades out
      .to([this.loader, this.text], {
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: 'power2.in'
      })

      // Phase 8: Overlay slides away
      .to(this.overlay, {
        clipPath: 'circle(0% at 50% 50%)',
        duration: 1,
        ease: 'power3.inOut'
      }, '-=0.3');
  }

  private destroy(): void {
    this.overlay.remove();
  }

  public skip(): void {
    this.timeline.progress(1);
  }
}
