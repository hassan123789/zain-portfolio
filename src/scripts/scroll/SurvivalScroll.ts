// SurvivalScroll - 生存の慣性
// 止まれない。止まりたくない。でも、時々休む。

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollOptions {
  wrapper?: HTMLElement;
  content?: HTMLElement;
  smooth?: number;
  onScroll?: (scroll: number, velocity: number) => void;
}

export class SurvivalScroll {
  private wrapper: HTMLElement;
  private content: HTMLElement;
  private smooth: number;
  private onScrollCallback?: (scroll: number, velocity: number) => void;

  private currentScroll = 0;
  private targetScroll = 0;
  private velocity = 0;
  private isRunning = false;
  private rafId = 0;

  constructor(options: ScrollOptions = {}) {
    this.wrapper = options.wrapper || document.body;
    this.content = options.content || document.querySelector('main') as HTMLElement;
    this.smooth = options.smooth || 0.08;
    this.onScrollCallback = options.onScroll;

    this.init();
  }

  private init(): void {
    // Set up fixed wrapper and scrollable content
    this.setupStyles();
    this.bindEvents();
    this.isRunning = true;
    this.animate();

    // Set up ScrollTrigger
    ScrollTrigger.scrollerProxy(this.wrapper, {
      scrollTop: (value?: number) => {
        if (value !== undefined) {
          this.targetScroll = value;
          return value;
        }
        return this.currentScroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    });

    ScrollTrigger.defaults({ scroller: this.wrapper });
  }

  private setupStyles(): void {
    // Add smooth scrolling CSS
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        overflow: hidden;
        height: 100%;
      }

      .scroll-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .scroll-content {
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    this.wrapper.classList.add('scroll-wrapper');
    this.content.classList.add('scroll-content');
  }

  private bindEvents(): void {
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    window.addEventListener('resize', this.onResize.bind(this));

    // Keyboard navigation
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private touchStartY = 0;

  private onWheel(e: WheelEvent): void {
    e.preventDefault();

    // Normalize wheel delta across browsers
    const delta = e.deltaY;
    this.targetScroll += delta;

    // Clamp to content bounds
    const maxScroll = this.content.scrollHeight - window.innerHeight;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
  }

  private onTouchStart(e: TouchEvent): void {
    this.touchStartY = e.touches[0].clientY;
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();

    const touchY = e.touches[0].clientY;
    const delta = this.touchStartY - touchY;
    this.touchStartY = touchY;

    this.targetScroll += delta * 1.5; // Touch sensitivity

    const maxScroll = this.content.scrollHeight - window.innerHeight;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const scrollAmount = window.innerHeight * 0.3;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        this.targetScroll += scrollAmount;
        break;
      case 'ArrowUp':
      case 'PageUp':
        this.targetScroll -= scrollAmount;
        break;
      case 'Home':
        this.targetScroll = 0;
        break;
      case 'End':
        this.targetScroll = this.content.scrollHeight - window.innerHeight;
        break;
      case ' ': // Space
        this.targetScroll += e.shiftKey ? -scrollAmount : scrollAmount;
        break;
    }

    const maxScroll = this.content.scrollHeight - window.innerHeight;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
  }

  private onResize(): void {
    ScrollTrigger.refresh();
  }

  private animate(): void {
    if (!this.isRunning) return;

    // Calculate velocity
    const prevScroll = this.currentScroll;

    // Smooth interpolation (生存の慣性)
    this.currentScroll += (this.targetScroll - this.currentScroll) * this.smooth;

    // Calculate velocity for wave effect
    this.velocity = this.currentScroll - prevScroll;

    // Apply transform
    this.content.style.transform = `translate3d(0, ${-this.currentScroll}px, 0)`;

    // Callback for wave connection
    this.onScrollCallback?.(this.currentScroll, this.velocity);

    // Update ScrollTrigger
    ScrollTrigger.update();

    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }

  public scrollTo(target: number | HTMLElement, duration = 1): void {
    let targetY: number;

    if (typeof target === 'number') {
      targetY = target;
    } else {
      const rect = target.getBoundingClientRect();
      targetY = this.currentScroll + rect.top;
    }

    gsap.to(this, {
      targetScroll: targetY,
      duration,
      ease: 'power3.inOut'
    });
  }

  public getScroll(): number {
    return this.currentScroll;
  }

  public getVelocity(): number {
    return this.velocity;
  }

  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);
    ScrollTrigger.kill();
  }
}
