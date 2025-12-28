// ExistenceCursor - 存在の痕跡
// あなたが画面に触れた証
// 速度で歪む - 急いでいる時の焦り

import gsap from 'gsap';

interface CursorOptions {
  container: HTMLElement;
}

export class ExistenceCursor {
  private container: HTMLElement;
  private cursor: HTMLElement;
  private cursorInner: HTMLElement;
  private cursorTrail: HTMLElement[];

  private mouse = { x: 0, y: 0 };
  private prevMouse = { x: 0, y: 0 };
  private currentPos = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  private isHovering = false;
  private trailCount = 5;

  constructor(options: CursorOptions) {
    this.container = options.container;
    this.cursorTrail = [];

    // Create cursor elements
    this.cursor = this.createCursorElement();
    this.cursorInner = this.createInnerElement();
    this.cursor.appendChild(this.cursorInner);

    // Create trail
    for (let i = 0; i < this.trailCount; i++) {
      const trail = this.createTrailElement(i);
      this.cursorTrail.push(trail);
      this.container.appendChild(trail);
    }

    this.container.appendChild(this.cursor);

    this.bindEvents();
    this.animate();
  }

  private createCursorElement(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'existence-cursor';
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 40px;
      height: 40px;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transform: translate(-50%, -50%);
    `;
    return el;
  }

  private createInnerElement(): HTMLElement {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid rgba(0, 212, 255, 0.8);
      background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%);
      transition: transform 0.15s ease-out, border-color 0.3s ease;
    `;
    return el;
  }

  private createTrailElement(index: number): HTMLElement {
    const el = document.createElement('div');
    const size = 8 - index * 1.2;
    const opacity = 0.6 - index * 0.1;

    el.className = 'cursor-trail';
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(0, 212, 255, ${opacity});
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    return el;
  }

  private bindEvents(): void {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Hover detection for interactive elements
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHover(true));
      el.addEventListener('mouseleave', () => this.setHover(false));
    });
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  private onMouseDown(): void {
    gsap.to(this.cursorInner, {
      scale: 0.8,
      duration: 0.1,
      ease: 'power2.out'
    });

    // Ripple effect
    this.createRipple();
  }

  private onMouseUp(): void {
    gsap.to(this.cursorInner, {
      scale: this.isHovering ? 1.5 : 1,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)'
    });
  }

  private setHover(hovering: boolean): void {
    this.isHovering = hovering;

    gsap.to(this.cursorInner, {
      scale: hovering ? 1.5 : 1,
      borderColor: hovering ? 'rgba(255, 51, 102, 0.9)' : 'rgba(0, 212, 255, 0.8)',
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  private createRipple(): void {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      top: ${this.mouse.y}px;
      left: ${this.mouse.x}px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid rgba(0, 212, 255, 0.8);
      pointer-events: none;
      z-index: 9997;
      transform: translate(-50%, -50%);
    `;

    this.container.appendChild(ripple);

    gsap.to(ripple, {
      width: 100,
      height: 100,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
  }

  private animate(): void {
    // Calculate velocity (速度計算)
    this.velocity.x = this.mouse.x - this.prevMouse.x;
    this.velocity.y = this.mouse.y - this.prevMouse.y;
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;

    // Smooth cursor following
    const ease = 0.15;
    this.currentPos.x += (this.mouse.x - this.currentPos.x) * ease;
    this.currentPos.y += (this.mouse.y - this.currentPos.y) * ease;

    // Calculate skew based on velocity (速度でスキュー)
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    const angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
    const squeeze = Math.min(speed * 0.015, 0.5); // Max 50% squeeze

    // Apply skew transform to cursor
    const scaleX = 1 + squeeze;
    const scaleY = 1 - squeeze * 0.5;
    this.cursorInner.style.transform = `rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;

    // Main cursor position
    this.cursor.style.left = `${this.currentPos.x}px`;
    this.cursor.style.top = `${this.currentPos.y}px`;

    // Trail with delayed following
    this.cursorTrail.forEach((trail, index) => {
      const delay = (index + 1) * 0.08;
      const tx = this.currentPos.x - (this.currentPos.x - this.mouse.x) * delay;
      const ty = this.currentPos.y - (this.currentPos.y - this.mouse.y) * delay;

      trail.style.left = `${tx}px`;
      trail.style.top = `${ty}px`;
    });

    requestAnimationFrame(this.animate.bind(this));
  }

  public updateHoverElements(): void {
    // Re-bind hover events for dynamically added elements
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHover(true));
      el.addEventListener('mouseleave', () => this.setHover(false));
    });
  }

  public destroy(): void {
    this.cursor.remove();
    this.cursorTrail.forEach(trail => { trail.remove(); });
  }
}
