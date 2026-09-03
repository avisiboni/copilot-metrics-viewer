import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useEffect, useId, useRef, useState, type JSX } from 'react';
import {
  COPILOT_GHOST_HINTS,
  COPILOT_GHOST_SNIPPETS,
} from './copilot-ghost-snippets';
import styles from './DocsHomeExperience.module.css';

type LocaleCopy = {
  badge: string;
  title: string;
  titleAccent: string;
  tagline: string;
  chips: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  mouseHint: string;
};

const COPY: Record<string, LocaleCopy> = {
  he: {
    badge: 'GitHub Copilot · מדדי שימוש',
    title: 'Copilot Metrics',
    titleAccent: 'Viewer',
    tagline:
      'תיעוד מלא ללוח הבקרה — תובנות שימוש, דפוסי אימוץ, חיוב Premium וסוכני Copilot. הזיזו את העכבר ולחצו כדי לקבל הצעה.',
    chips: ['acceptanceRate', 'usagePatterns', 'agentMode', 'rolling28d'],
    ctaPrimary: 'התחל לקרוא',
    ctaSecondary: 'מדריך למשתמש',
    mouseHint: 'הזיזו את העכבר — הצעות רפאים כמו ב-Copilot. לחיצה = קבלה.',
  },
  en: {
    badge: 'GitHub Copilot · Usage metrics',
    title: 'Copilot Metrics',
    titleAccent: 'Viewer',
    tagline:
      'Full docs for your org dashboard — usage insights, adoption patterns, Premium billing, and Copilot agents. Move your mouse; click to accept.',
    chips: ['acceptanceRate', 'usagePatterns', 'agentMode', 'rolling28d'],
    ctaPrimary: 'Get started',
    ctaSecondary: 'User guide',
    mouseHint: 'Move the mouse for ghost suggestions — like inline Copilot. Click to accept.',
  },
};

const CHIP_LABELS: Record<string, Record<string, string>> = {
  he: {
    acceptanceRate: '↑ acceptance_rate',
    usagePatterns: 'usage_pattern',
    agentMode: 'agent_mode',
    rolling28d: 'rolling_28d',
  },
  en: {
    acceptanceRate: '↑ acceptance_rate',
    usagePatterns: 'usage_pattern',
    agentMode: 'agent_mode',
    rolling28d: 'rolling_28d',
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pickSnippet(): string {
  return COPILOT_GHOST_SNIPPETS[Math.floor(Math.random() * COPILOT_GHOST_SNIPPETS.length)]!;
}

export default function DocsHomeExperience(): JSX.Element {
  const { siteConfig, i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale === 'he' ? 'he' : 'en';
  const isRtl = i18n.currentLocale === 'he';
  const copy = COPY[locale] ?? COPY.en!;
  const chipLabels = CHIP_LABELS[locale] ?? CHIP_LABELS.en!;

  const introPath =
    (siteConfig.customFields?.introDocPath as string | undefined) ?? '/docs/intro';
  const userGuidePath =
    (siteConfig.customFields?.userGuidePath as string | undefined) ??
    '/docs/user-guide/overview';

  const shellRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostTextRef = useRef<HTMLDivElement>(null);
  const tabPillRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const ghostVisibleRef = useRef(false);
  const lastMoveRef = useRef(0);
  const snippetRef = useRef(pickSnippet());

  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' ? prefersReducedMotion() : false,
  );
  const sparkGradId = useId().replace(/:/g, '');

  /* ── Canvas: Copilot "neural" field tied to mouse ── */
  useEffect(() => {
    if (reducedMotion) return undefined;

    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const linkDist = 120;
    const mouseRadius = 160;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.floor((rect.width * rect.height) / 14000));
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.8,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = shell.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
      lastMoveRef.current = performance.now();
    };

    const onLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(shell);
    shell.addEventListener('mousemove', onMove);
    shell.addEventListener('mouseleave', onLeave);

    const primary = '100, 54, 223';
    const turquoise = '6, 197, 215';

    const tick = () => {
      const rect = shell.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const pts = particlesRef.current;
      const { x: mx, y: my, active } = mouseRef.current;

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < mouseRadius) {
            const force = (1 - dist / mouseRadius) * 0.08;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]!;
          const b = pts[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.35;
            const nearMouse =
              active &&
              (Math.hypot(a.x - mx, a.y - my) < mouseRadius ||
                Math.hypot(b.x - mx, b.y - my) < mouseRadius);
            ctx.strokeStyle = nearMouse
              ? `rgba(${turquoise}, ${alpha * 0.9})`
              : `rgba(${primary}, ${alpha * 0.65})`;
            ctx.lineWidth = nearMouse ? 1.2 : 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        const near =
          active && Math.hypot(p.x - mx, p.y - my) < mouseRadius * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, near ? p.r * 1.6 : p.r, 0, Math.PI * 2);
        ctx.fillStyle = near ? `rgba(${turquoise}, 0.95)` : `rgba(${primary}, 0.75)`;
        ctx.fill();
      }

      if (active) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, mouseRadius * 0.9);
        g.addColorStop(0, `rgba(${primary}, 0.14)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      shell.removeEventListener('mousemove', onMove);
      shell.removeEventListener('mouseleave', onLeave);
    };
  }, [reducedMotion]);

  /* ── Anime.js: hero entrance + ghost suggestions + accept burst ── */
  useEffect(() => {
    if (reducedMotion) return undefined;

    let disposed = false;
    let scopeRevert: (() => void) | undefined;
    let moveTimer: ReturnType<typeof setTimeout> | undefined;
    let idleGhostTimer: ReturnType<typeof setInterval> | undefined;

    const shell = shellRef.current;
    const hero = heroRef.current;
    const ghostEl = ghostTextRef.current;
    const tabEl = tabPillRef.current;
    const sparkEl = sparkRef.current;
    if (!shell || !hero) return undefined;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const showGhost = async (clientX: number, clientY: number) => {
      if (!ghostEl || !tabEl || ghostVisibleRef.current) return;
      const { animate, createSpring } = await import('animejs');
      if (disposed) return;

      ghostVisibleRef.current = true;
      snippetRef.current = pickSnippet();
      ghostEl.textContent = snippetRef.current;
      ghostEl.classList.remove(styles.ghostSuggestionAccepted);

      const offsetX = isRtl ? -24 : 28;
      const offsetY = 20;
      const gx = clientX + offsetX;
      const gy = clientY + offsetY;

      ghostEl.style.left = `${gx}px`;
      ghostEl.style.top = `${gy}px`;
      tabEl.style.left = `${gx}px`;
      tabEl.style.top = `${gy + 36}px`;

      animate(ghostEl, {
        opacity: [0, 0.92],
        translateX: [isRtl ? 16 : -16, 0],
        translateY: [8, 0],
        duration: 420,
        ease: 'out(3)',
      });
      animate(tabEl, {
        opacity: [0, 1],
        scale: [0.85, 1],
        delay: 180,
        duration: 500,
        ease: createSpring({ stiffness: 280, damping: 18 }),
      });
      if (sparkEl) {
        sparkEl.style.left = `${clientX}px`;
        sparkEl.style.top = `${clientY}px`;
        animate(sparkEl, {
          opacity: [0.4, 1, 0.7],
          scale: [0.6, 1.1, 1],
          duration: 600,
          ease: 'out(2)',
        });
      }
    };

    const hideGhost = async () => {
      if (!ghostEl || !tabEl || !ghostVisibleRef.current) return;
      const { animate } = await import('animejs');
      if (disposed) return;
      ghostVisibleRef.current = false;
      await Promise.all([
        animate(ghostEl, { opacity: 0, duration: 220, ease: 'in(2)' }).then(),
        animate(tabEl, { opacity: 0, duration: 180, ease: 'in(2)' }).then(),
      ]);
    };

    const acceptBurst = async (clientX: number, clientY: number) => {
      const { animate, stagger } = await import('animejs');
      if (disposed) return;

      if (ghostEl) {
        ghostEl.classList.add(styles.ghostSuggestionAccepted);
        await animate(ghostEl, {
          opacity: [0.92, 1],
          scale: [1, 1.02, 1],
          duration: 280,
          ease: 'out(2)',
        }).then();
      }
      if (tabEl) {
        animate(tabEl, {
          opacity: 0,
          scale: 0.8,
          duration: 200,
          ease: 'in(2)',
        });
      }

      const layer = ghostRef.current;
      if (layer) {
        const fragments = 14;
        for (let i = 0; i < fragments; i++) {
          const dot = document.createElement('div');
          dot.className = styles.burst;
          dot.style.left = `${clientX}px`;
          dot.style.top = `${clientY}px`;
          layer.appendChild(dot);
          const angle = (i / fragments) * Math.PI * 2;
          const dist = 40 + Math.random() * 70;
          animate(dot, {
            translateX: Math.cos(angle) * dist,
            translateY: Math.sin(angle) * dist,
            opacity: [0.9, 0],
            scale: [1, 0.2],
            duration: 650 + Math.random() * 200,
            delay: stagger(24),
            ease: 'out(4)',
            onComplete: () => dot.remove(),
          });
        }
      }

      if (hero) {
        animate(hero.querySelectorAll(`.${styles.chip}`), {
          scale: [1, 1.06, 1],
          duration: 400,
          delay: stagger(40, { from: 'center' }),
          ease: 'out(3)',
        });
      }

      setTimeout(() => {
        ghostVisibleRef.current = false;
        if (ghostEl) ghostEl.style.opacity = '0';
        if (tabEl) tabEl.style.opacity = '0';
      }, 400);
    };

    (async () => {
      const { animate, createScope, stagger } = await import('animejs');
      if (disposed) return;

      const scope = createScope({ root: hero }).add(() => {
        animate(hero.querySelectorAll('[data-hero]'), {
          opacity: [0, 1],
          translateY: [28, 0],
          delay: stagger(90, { start: 200 }),
          duration: 900,
          ease: 'out(4)',
        });
        animate(hero.querySelectorAll(`.${styles.titleAccent}`), {
          backgroundPosition: ['0% 50%', '100% 50%'],
          duration: 2400,
          ease: 'inOut(2)',
          alternate: true,
          loop: true,
        });
      });
      scopeRevert = () => scope.revert();
    })();

    const onPointerMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      if (sparkEl) {
        sparkEl.style.left = `${e.clientX}px`;
        sparkEl.style.top = `${e.clientY}px`;
        sparkEl.style.opacity = '0.85';
      }

      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        if (!ghostVisibleRef.current && performance.now() - lastMoveRef.current > 120) {
          void showGhost(e.clientX, e.clientY);
        }
      }, 380);

      if (ghostVisibleRef.current && ghostEl) {
        const offsetX = isRtl ? -24 : 28;
        ghostEl.style.left = `${e.clientX + offsetX}px`;
        ghostEl.style.top = `${e.clientY + 20}px`;
        if (tabEl) {
          tabEl.style.left = `${e.clientX + offsetX}px`;
          tabEl.style.top = `${e.clientY + 56}px`;
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button')) return;
      if (ghostVisibleRef.current) {
        void acceptBurst(e.clientX, e.clientY);
      } else {
        void showGhost(e.clientX, e.clientY);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.repeat || !ghostVisibleRef.current) return;
      if (!shell.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }
      void acceptBurst(pointer.x, pointer.y);
    };

    idleGhostTimer = setInterval(() => {
      if (!ghostVisibleRef.current && mouseRef.current.active) {
        void showGhost(pointer.x, pointer.y);
      }
    }, 5200);

    shell.addEventListener('mousemove', onPointerMove);
    shell.addEventListener('click', onClick);
    shell.addEventListener('keydown', onKeyDown);

    return () => {
      disposed = true;
      scopeRevert?.();
      if (moveTimer) clearTimeout(moveTimer);
      if (idleGhostTimer) clearInterval(idleGhostTimer);
      shell.removeEventListener('mousemove', onPointerMove);
      shell.removeEventListener('click', onClick);
      shell.removeEventListener('keydown', onKeyDown);
      void hideGhost();
    };
  }, [reducedMotion, isRtl]);

  /* Parallax on hero from mouse */
  useEffect(() => {
    if (reducedMotion) return undefined;
    const hero = heroRef.current;
    const shell = shellRef.current;
    if (!hero || !shell) return undefined;

    const onMove = (e: MouseEvent) => {
      const rect = shell.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.transform = `perspective(800px) rotateX(${ny * -2}deg) rotateY(${nx * 2}deg)`;
    };
    const onLeave = () => {
      hero.style.transform = '';
    };
    shell.addEventListener('mousemove', onMove);
    shell.addEventListener('mouseleave', onLeave);
    return () => {
      shell.removeEventListener('mousemove', onMove);
      shell.removeEventListener('mouseleave', onLeave);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={shellRef}
      className={styles.shell}
      aria-label="Documentation home"
      tabIndex={reducedMotion ? undefined : -1}
    >
      {!reducedMotion && <canvas ref={canvasRef} className={styles.canvas} aria-hidden />}

      <div ref={ghostRef} className={styles.ghostLayer} aria-hidden>
        <div ref={ghostTextRef} className={styles.ghostSuggestion} />
        <div ref={tabPillRef} className={styles.ghostTabPill}>
          <span className={styles.ghostTabKey}>{COPILOT_GHOST_HINTS.tab}</span>
          <span>{COPILOT_GHOST_HINTS.accept}</span>
        </div>
      </div>

      <div ref={sparkRef} className={styles.cursorSpark} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
            fill={`url(#${sparkGradId})`}
          />
          <defs>
            <linearGradient id={sparkGradId} x1="4" y1="2" x2="20" y2="18">
              <stop stopColor="#9766fd" />
              <stop offset="1" stopColor="#06c5d7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div ref={heroRef} className={styles.content}>
        <div data-hero className={styles.badge}>
          <span className={styles.badgeDot} />
          {copy.badge}
        </div>

        <h1 data-hero className={styles.title}>
          {copy.title}{' '}
          <span className={styles.titleAccent}>{copy.titleAccent}</span>
        </h1>

        <p data-hero className={styles.tagline}>
          {copy.tagline}
        </p>

        <div data-hero className={styles.chips}>
          {copy.chips.map((key) => (
            <span key={key} className={styles.chip}>
              {chipLabels[key]}
            </span>
          ))}
        </div>

        <div data-hero className={styles.actions}>
          <Link className="button button--primary button--lg" to={introPath}>
            {copy.ctaPrimary}
          </Link>
          <Link className="button button--secondary button--lg" to={userGuidePath}>
            {copy.ctaSecondary}
          </Link>
        </div>

        {!reducedMotion && (
          <p data-hero className={styles.hint}>
            {locale === 'he' ? (
              <>
                <kbd>Tab</kbd> לקבלת הצעה · לחיצה על הרקע
              </>
            ) : (
              <>
                Press <kbd>Tab</kbd> to accept · click anywhere
              </>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
