import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Frame Sequence Config ─────────────────────────────────────────────────
const FRAME_NAMES = Array.from({ length: 626 }, (_, i) => {
  const num = String(i + 1).padStart(4, "0");
  return `/frame 2/${num}.jpg`;
});

// ─── Loading screen video ──────────────────────────────────────────────────
const LOADER_VIDEO_URL = "/motion-graphics.mp4";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "رشفه" },
      { name: "description", content: "قهوة متخصصة تُصنع بشغف. حبوب من أجود المصادر، محمّصة بخبرة، مقدّمة باهتمام." },
      { property: "og:title", content: "رشفه" },
      { property: "og:description", content: "قهوة متخصصة تُصنع بشغف. كل رشفة تحكي قصة." },
    ],
    links: [],
  }),
  component: Index,
});

const NAV_ITEMS = ["الرئيسية", "قصتنا", "القائمة", "التجربة", "موقعنا"];
const NAV_ANCHORS: Record<string, string> = {
  "الرئيسية": "home",
  "قصتنا": "story",
  "القائمة": "menu",
  "التجربة": "experience",
  "موقعنا": "findus",
};

// ─── Loading screen: fullscreen video only ─────────────────────────────────
function VideoLoader({ exiting }: { exiting: boolean }) {
  return (
    <div
      className={exiting ? "video-loader loader-exit" : "video-loader"}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", zIndex: 9999, background: "#1a0e06", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <video
        autoPlay muted loop playsInline src={LOADER_VIDEO_URL}
        style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "100vw", maxHeight: "100dvh" }}
      />
      <style>{`
        .video-loader { animation: loaderFadeIn 0.3s ease both; }
        @keyframes loaderFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .loader-exit { animation: loaderFadeOut 0.8s ease forwards !important; }
        @keyframes loaderFadeOut { 0% { opacity: 1; } 100% { opacity: 0; pointer-events: none; } }
      `}</style>
    </div>
  );
}

function Index() {
  const [open, setOpen] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [loaderExiting, setLoaderExiting] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef({ value: 0 });

  // ─── Draw a frame on the canvas (cover fit) ───────────────────────────
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const x = (cw - iw * scale) / 2;
    const y = (ch - ih * scale) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, iw * scale, ih * scale);
  }, []);

  // ─── Preload all frames ────────────────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // On reduced-motion just first+last
    let urls = FRAME_NAMES;
    if (prefersReduced) {
      urls = [FRAME_NAMES[0], FRAME_NAMES[FRAME_NAMES.length - 1]];
    }

    imagesRef.current = [];
    let loaded = 0;
    const total = urls.length;

    // Draw frame 0 immediately so canvas isn't blank
    const firstImg = new Image();
    firstImg.src = urls[0];
    firstImg.onload = () => drawFrame(0);
    imagesRef.current[0] = firstImg;

    urls.forEach((src, i) => {
      if (i === 0) { loaded++; setLoadProgress(Math.round((loaded / total) * 100)); return; }
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / total) * 100));
        if (loaded === total) {
          setTimeout(() => {
            const splash = document.getElementById("splash-loader");
            if (splash) {
              splash.style.opacity = "0";
              splash.style.pointerEvents = "none";
              setTimeout(() => {
                splash.remove();
                setFramesReady(true);
              }, 800);
            } else {
              setFramesReady(true);
            }
          }, 300);
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === total) {
          const splash = document.getElementById("splash-loader");
          if (splash) {
            splash.style.opacity = "0";
            splash.style.pointerEvents = "none";
            setTimeout(() => {
              splash.remove();
              setFramesReady(true);
            }, 800);
          } else {
            setFramesReady(true);
          }
        }
      };
      imagesRef.current[i] = img;
    });
  }, [drawFrame]);

  // ─── Keep canvas sized to viewport ────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(frameIndexRef.current.value);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // ─── GSAP Scroll Animations ────────────────────────────────────────
  useGSAP(
    () => {
      if (!framesReady) return;

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const frameCount = FRAME_NAMES.length;

      // 1. Dynamic Lighting
      const sections = gsap.utils.toArray('section:not(#home)');
      sections.forEach((sec: any, i) => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top center",
          end: "bottom center",
          onEnter: () => gsap.to(lightRef.current, { backgroundColor: i % 2 === 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(59, 130, 246, 0.08)", scale: 1.2 + i * 0.1, duration: 1.5 }),
          onEnterBack: () => gsap.to(lightRef.current, { backgroundColor: i % 2 === 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(59, 130, 246, 0.08)", scale: 1.2 + i * 0.1, duration: 1.5 }),
        });
      });

      // 2. Parallax Layers
      gsap.utils.toArray('[data-speed]').forEach((el: any) => {
        const speed = parseFloat(el.getAttribute('data-speed'));
        gsap.to(el, {
          y: () => -100 * speed,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      // 3. Fade & Reveal Texts
      gsap.utils.toArray('.reveal-text').forEach((text: any) => {
        gsap.from(text, {
          scrollTrigger: { trigger: text, start: "top 85%" },
          y: 40, opacity: 0, duration: 1, ease: "power3.out"
        });
      });

      if (!heroRef.current) return;

      if (prefersReduced) {
        // Reduced-motion: just show first frame, jump to last at end
        drawFrame(0);
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "bottom bottom",
          onEnter: () => drawFrame(frameCount - 1),
          onLeaveBack: () => drawFrame(0),
        });
        return;
      }

      // 4. Canvas frame scrub (Apple-style)
      gsap.to(frameIndexRef.current, {
        value: frameCount - 1,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: window.innerWidth < 768 ? 0.5 : 1.5,
        },
        onUpdate: () => {
          drawFrame(Math.round(frameIndexRef.current.value));
        }
      });

      // 5. Intro headline + hero steps — frame-synced dust effect
      const headline = textRef.current;
      let headlineVisible = true;

      const steps = gsap.utils.toArray('.hero-step') as HTMLElement[];
      const stepData = steps.map((step) => ({
        el: step,
        frameIn: parseInt(step.getAttribute('data-frame-in') || '0'),
        frameOut: parseInt(step.getAttribute('data-frame-out') || '0'),
        visible: false,
      }));

      ScrollTrigger.create({
        trigger: heroRef.current!,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const currentFrame = Math.round(self.progress * (frameCount - 1));

          // Headline: scatter when past frame 65, gather when before
          if (headline) {
            if (currentFrame >= 65 && headlineVisible) {
              headlineVisible = false;
              headline.classList.remove('dust-gather');
              headline.classList.add('dust-scatter-out');
            } else if (currentFrame < 65 && !headlineVisible) {
              headlineVisible = true;
              headline.classList.remove('dust-scatter-out');
              headline.classList.add('dust-gather');
            }
          }

          // Steps
          stepData.forEach(({ el, frameIn, frameOut, visible }, i) => {
            const isVisible = currentFrame >= frameIn && currentFrame <= frameOut;
            if (isVisible && !visible) {
              stepData[i].visible = true;
              el.classList.remove('dust-scatter');
              el.style.opacity = '1';
              el.classList.add('dust-gather');
            } else if (!isVisible && visible) {
              stepData[i].visible = false;
              el.classList.remove('dust-gather');
              el.classList.add('dust-scatter');
              setTimeout(() => {
                if (!stepData[i].visible) el.style.opacity = '0';
              }, 650);
            }
          });
        },
      });
    },
    { dependencies: [framesReady] }
  );

  return (
    <div dir="rtl" className="relative min-h-screen bg-background" style={{ fontFamily: "'IBMPlexArabic', sans-serif" }}>
      {/* ── Dynamic Lighting ─────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          ref={lightRef}
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent blur-[120px] will-change-transform transition-colors duration-1000 mix-blend-screen opacity-60"
        />
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mx-auto w-full max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-6 py-3.5 shadow-sm backdrop-blur-md">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <i className="bx bx-coffee text-[24px]"></i>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Alexandria', sans-serif" }}>
                رشفه
              </span>
            </a>

            {/* Desktop nav */}
            <ul className="hidden items-center gap-7 md:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  <a
                    href={`#${NAV_ANCHORS[item]}`}
                    className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#menu"
              className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md md:inline-flex items-center gap-2"
            >
              اطلب الآن
            </a>

            <button
              type="button"
              aria-label="فتح القائمة"
              onClick={() => setOpen((v) => !v)}
              className="text-foreground transition-colors hover:text-foreground/70 md:hidden"
            >
              {open ? <i className="bx bx-x text-[28px]"></i> : <i className="bx bx-menu text-[28px]"></i>}
            </button>
          </div>

          {open && (
            <div className="mt-2 rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur md:hidden">
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${NAV_ANCHORS[item]}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {item}
                    </a>
                  </li>
                ))}
                <li className="mt-2 pt-2 border-t border-border">
                  <a href="#menu" onClick={() => setOpen(false)}
                    className="block rounded-xl bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">
                    اطلب الآن
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>

      {/* ── Hero — Canvas Frame Sequence (Apple-style) ─────────────────── */}
      <section ref={heroRef} id="home" className="relative h-[700vh] bg-black">
        <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black">
          {/* Canvas replaces the video */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full [backface-visibility:hidden]"
            style={{ display: "block" }}
          />

          {/* Overlays removed for clearer frames */}

          {/* Intro headline — dust gather on load, scatter on scroll */}
          <div
            id="hero-headline"
            ref={textRef}
            className="dust-gather relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center will-change-transform"
          >
            <h1 className="leading-tight text-white drop-shadow-lg" style={{ fontFamily: "'Alexandria', sans-serif" }}>
              <span className="dust-text block text-6xl font-light md:text-7xl lg:text-8xl opacity-90">
                كل
              </span>
              <span className="dust-text block text-6xl font-bold md:text-7xl lg:text-8xl">
                رشفة تحكي قصة.
              </span>
            </h1>

            <div className="dust-sub mt-16 flex animate-bounce items-center gap-2 text-sm text-white/50">
              <span>مرّر للاستكشاف</span>
              <i className="bx bx-chevron-down text-[22px]"></i>
            </div>
          </div>

          {/* Scrolling Steps — dust particle animation synced to frames */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{ fontFamily: "'Alexandria', sans-serif" }}>
            {[
              {
                title: "منبع النكهة",
                sub: "أجود حبوب البن المختارة بعناية",
                frames: [150, 258],
                pos: "bottom-16 right-10 md:right-24 text-right items-end",
              },
              {
                title: "وهج التحميص",
                sub: "تحميص متقن يمنح النكهة عمقها",
                frames: [289, 383],
                pos: "bottom-16 left-10 md:left-24 text-left items-start",
              },
              {
                title: "دقة الطحن",
                sub: "طحن مثالي لاستخلاص متوازن",
                frames: [410, 470],
                pos: "bottom-16 right-10 md:right-24 text-right items-end",
              },
              {
                title: "فن الاستخلاص",
                sub: "كل قطرة تُحضَّر باتقان",
                frames: [495, 586],
                pos: "bottom-16 left-10 md:left-24 text-left items-start",
              },
              {
                title: "تجربة لا تنسى",
                sub: "نكهة أصيلة تبقى في الذاكرة",
                frames: [605, 626],
                pos: "inset-x-0 bottom-16 text-center items-center",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`hero-step absolute flex flex-col justify-end px-4 pb-2 ${step.pos}`}
                style={{ opacity: 0 }}
                data-frame-in={step.frames[0]}
                data-frame-out={step.frames[1]}
              >
                <h2
                  className="dust-text text-2xl md:text-4xl font-bold text-white drop-shadow-lg leading-snug"
                  style={{ fontFamily: "'Qahwa', sans-serif" }}
                >
                  {step.title}
                </h2>
                <p
                  className="dust-sub mt-1 text-sm md:text-base text-white/65 font-light max-w-xs"
                  style={{ fontFamily: "'IBMPlexArabic', sans-serif" }}
                >
                  {step.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Menu ──────────────────────────────────────────────────────────── */}
      <section id="menu" className="relative bg-background py-20 border-b border-border/10">
        <div className="mx-auto max-w-7xl px-8 flex flex-col lg:flex-row gap-12 items-center">
          {/* Text Side */}
          <div className="lg:w-1/3 text-right">
            <span className="text-xs font-semibold tracking-widest text-[#ebd9c8]/70 uppercase">قائمتنا</span>
            <h2 className="mt-4 text-4xl font-bold text-[#ebd9c8] md:text-5xl leading-tight" style={{ fontFamily: "'Qahwa', sans-serif" }}>
              صُنعت لكل<br />مزاج.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-[#ebd9c8]/60">
              من الإسبريسو الجريء إلى اللاتيه الكريمي والحلويات اللذيذة، هناك شيء لكل محبي القهوة.
            </p>
            <a href="#menu" className="mt-8 inline-flex items-center justify-center border border-[#ebd9c8]/30 px-6 py-3 text-xs font-semibold tracking-widest text-[#ebd9c8] uppercase hover:bg-[#ebd9c8] hover:text-[#1f0b0a] transition-colors rounded-sm">
              عرض القائمة الكاملة
            </a>
          </div>

          {/* Cards Side */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: "/coffee_menu.png", title: "لاتيه كراميل", desc: "سلس. حلو. مثالي.", price: "٢٢ ريال" },
              { img: "/coffee_menu.png", title: "فانيليا مثلج", desc: "بارد. كريمي. منعش.", price: "٢٤ ريال" },
              { img: "/coffee_menu.png", title: "موكا بليس", desc: "غني. جريء. فاخر.", price: "٢٦ ريال" },
              { img: "/coffee_story.png", title: "كعكة الشوكولاتة", desc: "هشة ولذيذة.", price: "١٨ ريال" },
            ].map((item, i) => (
              <div key={item.title} className="group rounded-sm border border-border/20 bg-[#280d0a]/50 overflow-hidden hover:border-[#ebd9c8]/30 transition-colors">
                <div className="aspect-[4/5] overflow-hidden relative">
                   <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#150605] via-transparent to-transparent opacity-90" />
                </div>
                <div className="p-4 text-center -mt-16 relative z-10">
                   <h3 className="text-sm font-bold text-[#ebd9c8] tracking-wide">{item.title}</h3>
                   <p className="mt-1 text-[11px] text-[#ebd9c8]/60">{item.desc}</p>
                   <p className="mt-3 text-xs font-semibold text-[#ebd9c8]/80">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cafe Split ──────────────────────────────────────────────────────── */}
      <section className="bg-[#f2ece4] flex flex-col md:flex-row">
        {/* Left Side (Text) */}
        <div className="flex-1 flex flex-col justify-center px-12 py-20 md:px-24">
           <h2 className="text-4xl md:text-5xl font-bold text-[#150605] leading-snug" style={{ fontFamily: "'Qahwa', sans-serif" }}>
             كل كوب<br />مُعد بشغف
           </h2>
           <p className="mt-6 text-lg text-[#150605]/70 leading-relaxed max-w-md">
             نحن نؤمن بأن القهوة ليست مجرد مشروب، بل هي تجربة. في مقهانا، نجمع بين أجود أنواع الحبوب المستدامة وأمهر صُناع القهوة لنقدم لك لحظة استثنائية في كل رشفة.
           </p>
           <a href="#about" className="mt-8 inline-flex items-center gap-2 border border-[#150605] text-[#150605] px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#150605] hover:text-[#ebd9c8] transition-colors w-fit">
             اكتشف قصتنا <i className="bx bx-chevron-left text-[18px]"></i>
           </a>
        </div>
        {/* Right Side (Image) */}
        <div className="flex-1">
           <img src="/barista_brewing.png" alt="تحضير القهوة" className="w-full h-full object-cover min-h-[500px]" />
        </div>
      </section>

      {/* ── Coffee Products ────────────────────────────────────────────────── */}
      <section className="bg-[#150605] py-24 border-b border-[#ebd9c8]/10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-[#ebd9c8]/60 uppercase">المتجر</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#ebd9c8]" style={{ fontFamily: "'Qahwa', sans-serif" }}>
              محاصيلنا المميزة
            </h2>
          </div>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-8 pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-8 px-8 md:mx-0 md:px-0">
            {[
              {
                id: 1,
                name: "إثيوبيا يرجاشيفي",
                notes: "ياسمين، توت أزرق، ليمون",
                roast: "فاتح",
                price: "٧٥ ريال",
              },
              {
                id: 2,
                name: "كولومبيا سوبريمو",
                notes: "شوكولاتة داكنة، كراميل، جوز",
                roast: "متوسط",
                price: "٦٥ ريال",
              },
              {
                id: 3,
                name: "مزيج مبروع",
                notes: "بندق، عسل، كاكاو",
                roast: "متوسط إلى غامق",
                price: "٨٠ ريال",
              }
            ].map((product) => (
              <div key={product.id} className="min-w-[85vw] md:min-w-0 shrink-0 snap-center group rounded-2xl border border-[#ebd9c8]/10 bg-[#ebd9c8]/5 overflow-hidden transition-all hover:border-[#ebd9c8]/30 hover:bg-[#ebd9c8]/10">
                <div className="aspect-[4/3] relative bg-[#ebd9c8]/10 p-8 flex items-center justify-center overflow-hidden">
                  <i className="bx bx-shopping-bag text-[70px] text-[#ebd9c8]/30 group-hover:scale-110 transition-transform duration-500"></i>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-[#ebd9c8] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#ebd9c8]/60 mb-4">{product.notes}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#ebd9c8]/10">
                    <span className="text-xs bg-[#ebd9c8]/10 text-[#ebd9c8] px-3 py-1 rounded-full">{product.roast}</span>
                    <span className="font-bold text-[#ebd9c8]">{product.price}</span>
                  </div>
                  <button className="w-full mt-6 bg-[#ebd9c8] text-[#150605] py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-[1.02]">
                    أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/products" className="inline-flex items-center gap-2 text-[#ebd9c8] hover:text-white border-b border-[#ebd9c8]/30 hover:border-white pb-1 transition-all">
              عرض كل المنتجات <i className="bx bx-left-arrow-alt"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#150605] pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 border-b border-[#ebd9c8]/10 pb-16">
            
            {/* Brand & Socials */}
            <div className="flex flex-col items-center md:items-start text-center md:text-right">
              <a href="#home" className="flex items-center gap-2 mb-6">
                <i className="bx bxs-coffee-bean text-[32px] text-[#ebd9c8]"></i>
                <span className="text-2xl font-bold text-[#ebd9c8]" style={{ fontFamily: "'Qahwa', sans-serif" }}>مبروع</span>
              </a>
              <div className="flex gap-4">
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebd9c8]/20 text-[#ebd9c8]/60 transition-colors hover:border-[#ebd9c8] hover:text-[#ebd9c8]">
                  <i className="bx bxl-instagram text-[20px]"></i>
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebd9c8]/20 text-[#ebd9c8]/60 transition-colors hover:border-[#ebd9c8] hover:text-[#ebd9c8]">
                  <i className="bx bxl-twitter text-[20px]"></i>
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebd9c8]/20 text-[#ebd9c8]/60 transition-colors hover:border-[#ebd9c8] hover:text-[#ebd9c8]">
                  <i className="bx bxl-facebook text-[20px]"></i>
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-16 text-center md:text-right">
              {[
                { title: "المتجر", links: ["القهوة", "المعدات", "الاشتراكات", "الهدايا"] },
                { title: "عن مبروع", links: ["قصتنا", "المصادر", "الوظائف", "تواصل معنا"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-[11px] font-bold tracking-widest text-[#ebd9c8] uppercase mb-6">{col.title}</h4>
                  <ul className="space-y-4">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-sm text-[#ebd9c8]/60 transition-colors hover:text-[#ebd9c8]">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-[#ebd9c8]/40 md:flex-row text-xs">
            <p>© {new Date().getFullYear()} مبروع للقهوة. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#ebd9c8] transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-[#ebd9c8] transition-colors">شروط الخدمة</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
