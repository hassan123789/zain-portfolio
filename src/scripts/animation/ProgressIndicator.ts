// ProgressIndicator - 生存の旅の進捗
// どこまで来たのか、どこへ向かうのか

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export class ProgressIndicator {
	private container: HTMLElement;
	private bar: HTMLElement;
	private dots: HTMLElement[];
	private sections: HTMLElement[];
	private currentSection = 0;

	constructor() {
		this.container = this.createContainer();
		this.bar = this.createBar();
		this.dots = [];
		this.sections = Array.from(document.querySelectorAll("section[id]"));

		this.container.appendChild(this.bar);

		// Create dots for each section
		this.sections.forEach((section, index) => {
			const dot = this.createDot(index, section.id);
			this.dots.push(dot);
			this.container.appendChild(dot);
		});

		document.body.appendChild(this.container);

		this.bindScroll();
	}

	private createContainer(): HTMLElement {
		const el = document.createElement("div");
		el.className = "progress-indicator";
		el.style.cssText = `
      position: fixed;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    `;
		return el;
	}

	private createBar(): HTMLElement {
		const wrapper = document.createElement("div");
		wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1px;
      overflow: hidden;
    `;

		const fill = document.createElement("div");
		fill.className = "progress-fill";
		fill.style.cssText = `
      width: 100%;
      height: 0%;
      background: linear-gradient(180deg, #00d4ff 0%, #7d3cef 100%);
      border-radius: 1px;
      transition: height 0.3s ease-out;
    `;

		wrapper.appendChild(fill);
		return wrapper;
	}

	private createDot(index: number, sectionId: string): HTMLElement {
		const dot = document.createElement("a");
		dot.href = `#${sectionId}`;
		dot.className = "progress-dot";
		dot.dataset.index = String(index);
		dot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: transparent;
      margin: 12px 0;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    `;

		// Tooltip
		const tooltip = document.createElement("span");
		tooltip.textContent =
			sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
		tooltip.style.cssText = `
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(10, 10, 15, 0.9);
      color: #f0f0f5;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      border: 1px solid rgba(0, 212, 255, 0.3);
    `;
		dot.appendChild(tooltip);

		dot.addEventListener("mouseenter", () => {
			tooltip.style.opacity = "1";
		});

		dot.addEventListener("mouseleave", () => {
			tooltip.style.opacity = "0";
		});

		dot.addEventListener("click", (e) => {
			e.preventDefault();
			const target = document.getElementById(sectionId);
			if (target) {
				target.scrollIntoView({ behavior: "smooth" });
			}
		});

		return dot;
	}

	private bindScroll(): void {
		// Update progress bar
		window.addEventListener("scroll", () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const progress = (scrollTop / docHeight) * 100;

			const fill = this.bar.querySelector(".progress-fill") as HTMLElement;
			if (fill) {
				fill.style.height = `${progress}%`;
			}
		});

		// Update active dot based on section visibility
		this.sections.forEach((section, index) => {
			ScrollTrigger.create({
				trigger: section,
				start: "top center",
				end: "bottom center",
				onEnter: () => this.setActiveSection(index),
				onEnterBack: () => this.setActiveSection(index),
			});
		});
	}

	private setActiveSection(index: number): void {
		this.currentSection = index;

		this.dots.forEach((dot, i) => {
			if (i === index) {
				dot.style.borderColor = "#00d4ff";
				dot.style.background = "rgba(0, 212, 255, 0.3)";
				dot.style.transform = "scale(1.2)";
			} else if (i < index) {
				dot.style.borderColor = "#7d3cef";
				dot.style.background = "rgba(125, 60, 239, 0.3)";
				dot.style.transform = "scale(1)";
			} else {
				dot.style.borderColor = "rgba(255, 255, 255, 0.3)";
				dot.style.background = "transparent";
				dot.style.transform = "scale(1)";
			}
		});
	}

	public destroy(): void {
		this.container.remove();
	}
}

// Counter Animation Function
export function animateCounter(
	element: HTMLElement,
	target: number,
	duration = 2000,
): void {
	const start = 0;
	const startTime = performance.now();
	const suffix = element.dataset.counterSuffix || "";
	const prefix = element.dataset.counterPrefix || "";

	const update = (currentTime: number) => {
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / duration, 1);

		// Easing
		const easeOut = 1 - (1 - progress) ** 3;
		const current = Math.round(start + (target - start) * easeOut);

		element.textContent = `${prefix}${current}${suffix}`;

		if (progress < 1) {
			requestAnimationFrame(update);
		}
	};

	requestAnimationFrame(update);
}

// Initialize counters
export function initCounters(): void {
	const counters = document.querySelectorAll<HTMLElement>("[data-counter]");

	counters.forEach((counter) => {
		const target = parseInt(counter.dataset.counter || "0");

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animateCounter(counter, target);
						observer.disconnect();
					}
				});
			},
			{ threshold: 0.5 },
		);

		observer.observe(counter);
	});
}
