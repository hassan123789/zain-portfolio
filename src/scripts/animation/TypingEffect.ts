// TypingEffect - ターミナルのタイピング
// 一文字ずつ、存在を刻む

interface TypingOptions {
  element: HTMLElement;
  text?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
}

export class TypingEffect {
  private element: HTMLElement;
  private text: string;
  private speed: number;
  private delay: number;
  private showCursor: boolean;
  private cursorElement: HTMLElement | null = null;
  private onComplete?: () => void;

  constructor(options: TypingOptions) {
    this.element = options.element;
    this.text = options.text || this.element.textContent || '';
    this.speed = options.speed || 50;
    this.delay = options.delay || 0;
    this.showCursor = options.cursor !== false;
    this.onComplete = options.onComplete;

    // Clear and prepare
    this.element.textContent = '';

    if (this.showCursor) {
      this.cursorElement = document.createElement('span');
      this.cursorElement.className = 'typing-cursor';
      this.cursorElement.textContent = '▋';
      this.cursorElement.style.cssText = `
        animation: blink 1s step-end infinite;
        color: #00d4ff;
      `;
      this.element.appendChild(this.cursorElement);
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.typeCharacters(0, resolve);
      }, this.delay);
    });
  }

  private typeCharacters(index: number, resolve: () => void): void {
    if (index < this.text.length) {
      // Insert character before cursor
      const char = document.createTextNode(this.text[index]);
      if (this.cursorElement) {
        this.element.insertBefore(char, this.cursorElement);
      } else {
        this.element.appendChild(char);
      }

      // Random speed variation for realism
      const variance = this.speed * 0.5;
      const nextDelay = this.speed + (Math.random() - 0.5) * variance;

      setTimeout(() => {
        this.typeCharacters(index + 1, resolve);
      }, nextDelay);
    } else {
      // Typing complete
      if (this.cursorElement) {
        // Blink a few times then hide
        setTimeout(() => {
          if (this.cursorElement) {
            this.cursorElement.style.opacity = '0';
          }
        }, 1500);
      }

      this.onComplete?.();
      resolve();
    }
  }

  public static injectStyles(): void {
    if (document.getElementById('typing-effect-styles')) return;

    const style = document.createElement('style');
    style.id = 'typing-effect-styles';
    style.textContent = `
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize typing for all elements with data-typing attribute
export function initTypingEffects(): void {
  TypingEffect.injectStyles();

  const elements = document.querySelectorAll<HTMLElement>('[data-typing]');

  elements.forEach((el, index) => {
    const text = el.dataset.typingText || el.textContent || '';
    const speed = parseInt(el.dataset.typingSpeed || '50');
    const delay = parseInt(el.dataset.typingDelay || String(index * 500));

    const typing = new TypingEffect({
      element: el,
      text,
      speed,
      delay
    });

    // Start when element is in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typing.start();
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(el);
  });
}
