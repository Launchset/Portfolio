"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./scroll-hero.module.css";

const DesktopHeroVisual = dynamic(() => import("./desktop-hero-visual"), { ssr: false });

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const range = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));

export default function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDesktopVisual, setShowDesktopVisual] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 701px)");
    const update = () => setShowDesktopVisual(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const nav = navRef.current;
    if (!section || !stage || !nav) return;

    let heroVisible = true;
    const updateMotionState = () => {
      stage.dataset.motion = heroVisible && !document.hidden ? "running" : "paused";
    };
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry?.isIntersecting ?? false;
        updateMotionState();
      },
      { rootMargin: "120px 0px" },
    );
    visibilityObserver.observe(section);
    document.addEventListener("visibilitychange", updateMotionState);
    updateMotionState();

    const cleanupMotionState = () => {
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", updateMotionState);
      delete stage.dataset.motion;
    };

    // Phones use a normal document-flow hero. Keeping them out of the pinned
    // scene also means touch scrolling is never captured by the animation.
    if (window.matchMedia("(max-width: 700px)").matches) {
      nav.dataset.visible = "true";
      return () => {
        cleanupMotionState();
        nav.dataset.visible = "false";
      };
    }

    const sceneStops = [0, 0.55, 0.84] as const;
    let frame = 0;
    let transitionFrame = 0;
    let transitioning = false;
    let released = false;
    let sceneIndex = 0;
    let visualProgress = 0;
    let lastRendered = -1;
    let wheelIntent = 0;
    let touchStartY: number | null = null;
    let lastScrollY = window.scrollY;
    let pointerAtTop = false;
    let headerVisible = false;
    let heroCompletionReported = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setHeaderVisible = (visible: boolean) => {
      if (visible === headerVisible) return;
      headerVisible = visible;
      nav.dataset.visible = visible ? "true" : "false";
    };

    const heroEnd = () =>
      section.offsetTop + section.offsetHeight - window.innerHeight;

    const syncSceneHeader = (progress: number) => {
      if (window.scrollY <= heroEnd() + 8) {
        setHeaderVisible(progress >= 0.4);
      }
    };

    const renderProgress = (rawProgress: number, force = false) => {
      const progress = clamp(rawProgress);
      if (!force && Math.abs(progress - lastRendered) < 0.00025) return;
      lastRendered = progress;
      visualProgress = progress;

      const introOut = range(progress, 0.1, 0.24);
      const focus = range(progress, 0.06, 0.3);
      const handoff = range(progress, 0.14, 0.44);
      const smoothHandoff = handoff * handoff * (3 - 2 * handoff);
      const contentIn = range(progress, 0.3, 0.44);
      const designIn = range(progress, 0.42, 0.53);
      const designOut = range(progress, 0.58, 0.66);
      const automationIn = range(progress, 0.64, 0.78);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const compact = viewportWidth < 900;
      const startWidth = Math.min(680, viewportWidth * (compact ? 0.86 : 0.46));
      const startHeight = startWidth / 1.32;
      const startScale = Math.min(
        0.72,
        (startWidth / viewportWidth + startHeight / viewportHeight) / 2,
      );
      const startX = viewportWidth * (compact ? 0.5 : 0.77);
      const startY = viewportHeight * (compact ? 0.76 : 0.53);
      const mix = (start: number, end: number) =>
        start + (end - start) * smoothHandoff;

      stage.style.setProperty("--intro-out", introOut.toString());
      stage.style.setProperty("--focus", focus.toString());
      stage.style.setProperty("--handoff", smoothHandoff.toString());
      stage.style.setProperty("--content-in", contentIn.toString());
      stage.style.setProperty("--content-opacity", "1");
      stage.style.setProperty("--content-y", `${(1 - contentIn) * 24}px`);
      stage.style.setProperty("--design-opacity", `${designIn * (1 - designOut)}`);
      stage.style.setProperty("--art-opacity", `${Math.max(0, 1 - automationIn * 1.4)}`);
      stage.style.setProperty("--sphere-opacity", `${1 - automationIn}`);
      stage.style.setProperty("--automation-opacity", automationIn.toString());
      stage.style.setProperty("--automation-y", `${(1 - automationIn) * 20}px`);
      stage.style.setProperty("--browser-scale", `${mix(startScale, 1)}`);
      stage.style.setProperty("--browser-tx", `${mix(startX - viewportWidth / 2, 0)}px`);
      stage.style.setProperty("--browser-ty", `${mix(startY - viewportHeight / 2, 0)}px`);
      stage.style.setProperty("--bar-h", `${mix(44, 0)}px`);
      stage.style.setProperty("--browser-opacity", "1");
      stage.style.setProperty("--browser-tilt", `${(1 - focus) * -5}deg`);
      stage.style.setProperty("--browser-radius", `${(1 - smoothHandoff) * 18}px`);
      stage.style.setProperty("--nav-space", `${smoothHandoff * 68}px`);
      stage.style.setProperty("--progress", progress.toString());
      syncSceneHeader(progress);
    };

    const actualProgress = () => {
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      return clamp((window.scrollY - section.offsetTop) / distance);
    };

    const syncFromScroll = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (currentScrollY > heroEnd() + 8) {
        if (pointerAtTop || scrollDelta < -3) setHeaderVisible(true);
        if (!pointerAtTop && scrollDelta > 3) setHeaderVisible(false);
      }

      lastScrollY = currentScrollY;
      if (transitioning || !released) return;
      const progress = actualProgress();
      renderProgress(progress);
      if (progress <= 0.001) {
        released = false;
        sceneIndex = 0;
        renderProgress(0, true);
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(syncFromScroll);
    };

    const requestResizeUpdate = () => renderProgress(visualProgress, true);

    const isInPinnedSequence = () => {
      const top = section.offsetTop;
      const end = top + section.offsetHeight - window.innerHeight;
      return window.scrollY >= top - 2 && window.scrollY <= end + 8;
    };

    const animateToScene = (targetIndex: number) => {
      const target = sceneStops[targetIndex];
      const start = visualProgress;
      if (Math.abs(target - start) < 0.001) return;

      const duration = 900 + Math.abs(target - start) * 520;
      const startedAt = performance.now();
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      transitioning = true;
      stage.dataset.transitioning = "true";

      const tick = (time: number) => {
        const elapsed = clamp((time - startedAt) / duration);
        const eased = elapsed < 0.5
          ? 4 * elapsed * elapsed * elapsed
          : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
        renderProgress(start + (target - start) * eased);

        if (elapsed < 1) {
          transitionFrame = window.requestAnimationFrame(tick);
          return;
        }

        renderProgress(target, true);
        sceneIndex = targetIndex;
        wheelIntent = 0;

        if (targetIndex === sceneStops.length - 1) {
          const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
          released = true;
          window.scrollTo(0, section.offsetTop + distance * target);
          if (!heroCompletionReported) {
            heroCompletionReported = true;
            window.dispatchEvent(new CustomEvent("launchset:hero-complete"));
          }
        }

        transitioning = false;
        delete stage.dataset.transitioning;
        root.style.scrollBehavior = previousScrollBehavior;
      };

      transitionFrame = window.requestAnimationFrame(tick);
    };

    const advance = (direction: 1 | -1) => {
      const targetIndex = sceneIndex + direction;
      if (targetIndex < 0 || targetIndex >= sceneStops.length) return false;
      animateToScene(targetIndex);
      return true;
    };

    const handleWheel = (event: WheelEvent) => {
      if (reducedMotion || event.ctrlKey || released) return;
      if (!isInPinnedSequence()) return;
      event.preventDefault();
      if (transitioning) return;

      wheelIntent += event.deltaY;
      if (Math.abs(wheelIntent) >= 36) {
        advance(wheelIntent > 0 ? 1 : -1);
        wheelIntent = 0;
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (reducedMotion || released || !isInPinnedSequence()) return;
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY === null && !transitioning) return;
      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (touchStartY === null || transitioning) return;
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const distance = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(distance) >= 32) advance(distance > 0 ? 1 : -1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (reducedMotion || released || !isInPinnedSequence() || transitioning) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      const forward = event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ";
      const backward = event.key === "ArrowUp" || event.key === "PageUp";
      if (!forward && !backward) return;
      if (advance(forward ? 1 : -1)) event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerAtTop = event.clientY <= 72;
      if (pointerAtTop && window.scrollY > heroEnd() + 8) {
        setHeaderVisible(true);
      }
    };

    const initialProgress = actualProgress();
    if (initialProgress >= sceneStops[sceneStops.length - 1]) {
      released = true;
      sceneIndex = sceneStops.length - 1;
      renderProgress(initialProgress, true);
      if (window.scrollY > heroEnd() + 8) setHeaderVisible(true);
    } else {
      renderProgress(0, true);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestResizeUpdate);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestResizeUpdate);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
      if (transitionFrame) window.cancelAnimationFrame(transitionFrame);
      delete stage.dataset.transitioning;
      cleanupMotionState();
    };
  }, []);

  return (
    <>
      <nav className={styles.handoffNav} ref={navRef} data-visible="false" aria-label="Main navigation">
        <a href="#top" aria-label="Launchset home">LAUNCHSET<span>.</span></a>
        <div>
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="/founder">Founder</a>
        </div>
        <button
          className={styles.heroMenuButton}
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="home-mobile-navigation"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileMenuOpen((current) => !current)}
        ><i /><i /></button>
        <a href="#contact">Start a project ↗</a>
      </nav>

      <nav id="home-mobile-navigation" className={styles.mobileNavPanel} data-open={mobileMenuOpen ? "true" : "false"} aria-label="Mobile navigation">
        <a href="#work" onClick={() => setMobileMenuOpen(false)}>Our work</a>
        <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
        <a href="#process" onClick={() => setMobileMenuOpen(false)}>Process</a>
        <a href="/founder" onClick={() => setMobileMenuOpen(false)}>Founder</a>
        <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Start a project <span>↗</span></a>
      </nav>

      <section className={styles.scrollSection} ref={sectionRef}>
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.aurora} aria-hidden="true" />

          <nav className={styles.nav} aria-label="Intro navigation">
            <a className={styles.logo} href="#top" aria-label="Launchset home">LAUNCHSET<span>.</span></a>
            <div className={styles.navLinks}>
              <a href="#work">Work</a>
              <a href="#services">Services</a>
              <a href="#process">Process</a>
              <a href="/founder">Founder</a>
            </div>
            <button
              className={styles.heroMenuButton}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="home-mobile-navigation"
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileMenuOpen((current) => !current)}
            ><i /><i /></button>
            <a className={styles.navCta} href="#contact">Start a project <span>↗</span></a>
          </nav>

        <div className={styles.intro} id="top">
          <div className={styles.eyebrow}><i /> DIGITAL DESIGN &amp; AUTOMATION STUDIO</div>
          <h1>Your business deserves more than a template<span>.</span></h1>
          <p>
            Distinctive websites and smart automations that create value, remove
            repetitive work and give your team more time for what matters.
          </p>
          <div className={styles.actions}>
            <a href="#work">Explore our work <span>→</span></a>
            <a href="#contact">Book a free call</a>
          </div>
        </div>

        <div className={styles.mobilePlanet} aria-hidden="true">
          <div className={styles.mobilePlanetGlow} />
          <div className={styles.orbit}><i /><i /><i /></div>
          <div className={styles.sphere} />
        </div>

        {showDesktopVisual && <DesktopHeroVisual />}

        </div>
      </section>
    </>
  );
}
