// SectionReveal - セクションが視界に入る時のアニメーション
// 存在を主張する。静かに、でも確実に。

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSectionReveals(): void {
  // Terminal sections - type in effect
  gsap.utils.toArray<HTMLElement>('.terminal-section').forEach((section) => {
    // Skip terminal-content that also has data-reveal (to avoid double animation)
    const content = section.querySelector('.terminal-content:not([data-reveal])');
    const header = section.querySelector('.terminal-header');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 30%',
        toggleActions: 'play none none none'  // Don't reverse - keep visible
      }
    });

    if (header) {
      tl.from(header, {
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    if (content) {
      tl.from(content, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.2');
    }
  });

  // Glitch text reveal
  gsap.utils.toArray<HTMLElement>('[data-reveal="glitch"]').forEach((el) => {
    const originalText = el.textContent || '';
    const chars = 'アイウエオカキクケコ01_';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        let iterations = 0;
        const maxIterations = 10;

        const interval = setInterval(() => {
          el.textContent = originalText
            .split('')
            .map((_char, i) => {
              if (i < iterations) return originalText[i];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

          iterations += 1;

          if (iterations > originalText.length + maxIterations) {
            clearInterval(interval);
            el.textContent = originalText;
          }
        }, 30);
      },
      once: true
    });
  });

  // Fade up elements - once only
  gsap.utils.toArray<HTMLElement>('[data-reveal="fade-up"]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Stagger children - once only, don't reverse
  gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((container) => {
    const children = container.children;

    // Set initial state explicitly
    gsap.set(children, { opacity: 1, y: 0 });

    gsap.from(children, {
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none none',  // Don't reverse
        once: true  // Only animate once
      },
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    });
  });

  // Line draw effect
  gsap.utils.toArray<HTMLElement>('[data-reveal="line"]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1,
      ease: 'power3.inOut'
    });
  });

  // Parallax effect for decorative elements
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.5');

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: () => window.innerHeight * speed * -0.5,
      ease: 'none'
    });
  });
}

// Magnetic hover effect for buttons/links
export function initMagneticElements(): void {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.3');

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });
}
