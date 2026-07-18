import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Hero video (background scroll-scrub) ─────────────────────────────────
const HERO_VIDEO_URL = "/Coffee_beans_form_coffee_cup_202607181643.mp4";

// ─── Loading screen video ──────────────────────────────────────────────────
const LOADER_VIDEO_URL = "/motion-graphics.mp4";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "مبروع — قهوة متخصصة" },
      { name: "description", content: "قهوة متخصصة تُصنع بشغف. حبوب من أجود المصادر، محمّصة بخبرة، مقدّمة باهتمام." },
      { property: "og:title", content: "مبروع — قهوة متخصصة" },
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
  const [videoReady, setVideoReady] = useState(false);
  const [loaderExiting, setLoaderExiting] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef(0);

  // ─── Preload hero video, show loader until ready ──────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let objectUrl = "";
    let isCancelled = false;

    const loadVideo = async () => {
      try {
        // Fetch the entire video as a blob so it plays and scrubs perfectly
        // This guarantees the loading screen stays until 100% downloaded
        const response = await fetch(HERO_VIDEO_URL);
        const blob = await response.blob();
        if (isCancelled) return;

        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;

        const onReady = () => {
          setTimeout(() => {
            setLoaderExiting(true);
            setTimeout(() => setVideoReady(true), 800);
          }, 300);
        };

        if (video.readyState >= 4) { onReady(); }
        else { video.addEventListener("canplaythrough", onReady, { once: true }); }
        
        video.load();
      } catch (error) {
        console.error("Video load error:", error);
        // Fallback to direct URL streaming if fetch fails
        if (isCancelled) return;
        video.src = HERO_VIDEO_URL;
        setLoaderExiting(true);
        setTimeout(() => setVideoReady(true), 800);
      }
    };

    loadVideo();

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // ─── GSAP Scroll Animations ────────────────────────────────────────
  useGSAP(() => {
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
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // 3. Fade & Reveal Texts
    gsap.utils.toArray('.reveal-text').forEach((text: any) => {
      gsap.from(text, {
        scrollTrigger: { trigger: text, start: "top 85%" },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    });

    // 4. Hero Text Sequence & Unified Video Scrubbing
    const video = videoRef.current;
    if (heroRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5 // Adds 1.5 seconds of smoothing/inertia to make the video feel buttery smooth
        }
      });

      // First: fade out hero intro text
      if (textRef.current) {
        tl.to(textRef.current, { y: -150, opacity: 0, duration: 1, ease: "none" });
      }

      // Then: cycle through each step
      gsap.utils.toArray('.hero-step').forEach((step: any) => {
        tl.fromTo(step, { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "none" })
          .to(step, { y: -150, opacity: 0, duration: 1, ease: "none" });
      });

      // Remove video tween from here so we can throttle it separately
    }

    // 5. Throttled Video Scrubbing (Fixes heavy browser lag)
    if (video && heroRef.current) {
      video.pause();
      
      let targetTime = 0;
      let lastUpdateTime = 0;

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          if (!Number.isNaN(video.duration) && video.duration > 0) {
            targetTime = self.progress * (video.duration - 0.05);
            const now = Date.now();
            
            // Throttle to 250ms (4 FPS) to completely eliminate CPU spikes
            if (now - lastUpdateTime > 250 && Math.abs(video.currentTime - targetTime) > 0.05) {
              requestAnimationFrame(() => {
                if (video) video.currentTime = targetTime;
              });
              lastUpdateTime = now;
            }
          }
        }
      });
    }
  });

  return (
    <div dir="rtl" className="relative min-h-screen bg-background" style={{ fontFamily: "'Qahwa', sans-serif" }}>
      {/* ── Dynamic Lighting ─────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          ref={lightRef}
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent blur-[120px] will-change-transform transition-colors duration-1000 mix-blend-screen opacity-60"
        />
      </div>

      {/* ── Loading screen ─────────────────────────────────────────────── */}
      {!videoReady && <VideoLoader exiting={loaderExiting} />}

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mx-auto w-full max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-6 py-3.5 shadow-sm backdrop-blur-md">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <i className="bx bx-coffee text-[24px]"></i>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Qahwa', sans-serif" }}>
                مبروع
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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} id="home" className="relative h-[400vh] bg-black">
        <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center [backface-visibility:hidden] [transform:translateZ(0)]"
            muted playsInline preload="auto"
            fetchPriority="high"
          />
          {/* Warm gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/65" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />

          <div ref={textRef} className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center will-change-transform">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/80 uppercase backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              قهوة متخصصة · منذ ٢٠١٨
            </span>

            <h1 className="leading-tight text-white drop-shadow-lg" style={{ fontFamily: "'Qahwa', sans-serif" }}>
              <span className="block text-6xl font-light md:text-7xl lg:text-8xl opacity-90">
                حيث كل
              </span>
              <span className="block text-6xl font-bold md:text-7xl lg:text-8xl">
                رشفة تحكي قصة.
              </span>
            </h1>

            <p className="mt-6 mb-8 max-w-xl text-lg text-white/75 font-light leading-relaxed">
              حبوب أصيلة من أجود المصادر، محمّصة بخبرة، وتُقدَّم باهتمام —<br className="hidden md:block" />
              كوبك المثالي بانتظارك.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#menu"
                className="rounded-full bg-primary px-7 py-3 font-medium text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              >
                استكشف القائمة
              </a>
              <a
                href="#story"
                className="rounded-full border border-white/30 bg-white/10 px-7 py-3 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                قصتنا
              </a>
            </div>

            <div className="mt-16 flex animate-bounce items-center gap-2 text-sm text-white/50">
              <span>مرّر للاستكشاف</span>
              <i className="bx bx-chevron-down text-[22px]"></i>
            </div>
          </div>

          {/* Scrolling Steps */}
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center text-center px-6" style={{ fontFamily: "'Qahwa', sans-serif" }}>
            <div className="hero-step absolute opacity-0 flex flex-col items-center justify-center">
              <i className="bx bx-star text-6xl text-[#ebd9c8] mb-6 drop-shadow-md"></i>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">جودة فاخرة</h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl drop-shadow-md">نستورد أجود حبوب القهوة من جميع أنحاء العالم.</p>
            </div>
            <div className="hero-step absolute opacity-0 flex flex-col items-center justify-center">
              <i className="bx bxs-flame text-6xl text-[#ebd9c8] mb-6 drop-shadow-md"></i>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">تحميص خبير</h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl drop-shadow-md">تُحمّص للوصول إلى النكهة والعبق المثاليين.</p>
            </div>
            <div className="hero-step absolute opacity-0 flex flex-col items-center justify-center">
              <i className="bx bx-coffee-togo text-6xl text-[#ebd9c8] mb-6 drop-shadow-md"></i>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">تجربة مثالية</h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl drop-shadow-md">من المقهى إلى كوبك، تجربة استثنائية دائماً.</p>
            </div>
            <div className="hero-step absolute opacity-0 flex flex-col items-center justify-center">
              <i className="bx bx-leaf text-6xl text-[#ebd9c8] mb-6 drop-shadow-md"></i>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">مصادر مستدامة</h2>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl drop-shadow-md">نهتم بالناس والكوكب الذي نزرع فيه.</p>
            </div>
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
