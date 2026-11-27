import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUpRight, Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// --- Magnetic Button Component ---
const Magnetic = ({ children, className = '' }: { children: React.ReactElement, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const xTo = gsap.quickTo(element, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(element, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = element.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.3);
      yTo(y * 0.3);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return React.cloneElement(children, {
    ref,
    className: `${children.props.className || ''} ${className}`,
  });
};

// --- Custom Cursor Component ---
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const text = textRef.current;
    if (!cursor || !text) return;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power3' });

    const moveCursor = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const viewTarget = target.closest('[data-cursor="view"]');
      
      if (viewTarget) {
        gsap.to(cursor, { scale: 3, backgroundColor: '#1A1A1A', duration: 0.3 });
        gsap.to(text, { opacity: 1, scale: 0.33, duration: 0.3 });
      } else {
        gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
        gsap.to(text, { opacity: 0, scale: 1, duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-4 h-4 rounded-full border border-charcoal pointer-events-none z-[100] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
    >
      <div ref={textRef} className="text-offwhite text-[8px] font-sans font-medium opacity-0 tracking-widest">
        VIEW
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [activeProject, setActiveProject] = useState<any>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const revealTopRef = useRef<HTMLDivElement>(null);
  const revealBottomRef = useRef<HTMLDivElement>(null);
  const revealImageRef = useRef<HTMLImageElement>(null);
  const revealContainerRef = useRef<HTMLDivElement>(null);

  // Smooth Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetId, { duration: 1.2 });
    } else {
      document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Header Scroll Logic
  useEffect(() => {
    let ticking = false;

    const updateHeaderState = () => {
      const heroEl = heroSectionRef.current;
      const headerEl = headerRef.current;
      const headerHeight = headerEl ? headerEl.offsetHeight : 72;
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
      setIsPastHero(window.scrollY >= Math.max(0, heroHeight - headerHeight));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    };

    updateHeaderState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Progressive Reveal Animations
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal-text');
    reveals.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
          },
        }
      );
    });

    const heroImg = document.querySelector('.hero-parallax-img');
    if (heroImg && heroSectionRef.current) {
      gsap.fromTo(
        heroImg,
        { scale: 1.04, yPercent: 0 },
        {
          scale: 1.12,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    const images = document.querySelectorAll('.parallax-img');
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.2, y: -50 },
        {
          scale: 1,
          y: 50,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });
  }, []);

  // Suzhou House Reveal Logic
  const handleProjectClick = (project: any) => {
    setActiveProject(project);
    
    // Lock scroll
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline();
    
    // 1. Show container
    tl.set(revealContainerRef.current, { display: 'block', opacity: 1 });
    
    // 2. Set initial states for split text
    tl.set(revealTopRef.current, { y: '0%' });
    tl.set(revealBottomRef.current, { y: '0%' });
    tl.set(revealImageRef.current, { scale: 1.2, opacity: 0 });

    // 3. Split animation
    tl.to(revealTopRef.current, { y: '-100%', duration: 1.5, ease: 'power4.inOut' }, 0.5)
      .to(revealBottomRef.current, { y: '100%', duration: 1.5, ease: 'power4.inOut' }, 0.5)
      .to(revealImageRef.current, { scale: 1, opacity: 1, duration: 1.5, ease: 'power4.inOut' }, 0.5)
      .fromTo('.project-hero-info', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 1.5);
      if (project.title === 'WATERBRIDGE HOUSE') {
    tl.call(
      () => {
        const quote =
          revealContainerRef.current?.querySelector('.hero-quote');
  
        if (quote) {
          gsap.fromTo(
            quote,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
            }
          );
        }
      },
      [],
      2.05
    );
  }
  };

  const closeProject = () => {
    if (revealContainerRef.current) {
      revealContainerRef.current.scrollTop = 0;
    }
    
    const tl = gsap.timeline({
      onComplete: () => {
        setActiveProject(null);
        document.body.style.overflow = '';
        gsap.set(revealContainerRef.current, { display: 'none' });
      }
    });

    tl.to(revealTopRef.current, { y: '0%', duration: 1, ease: 'power3.inOut' }, 0)
      .to(revealBottomRef.current, { y: '0%', duration: 1, ease: 'power3.inOut' }, 0)
      .to(revealImageRef.current, { opacity: 0, scale: 1.1, duration: 1, ease: 'power3.inOut' }, 0)
      .to(revealContainerRef.current, { opacity: 0, duration: 0.5 }, 1);
  };

  // Project Detail Animations
  useEffect(() => {
    if (!activeProject || !revealContainerRef.current) return;

    const container = revealContainerRef.current;
    let ctx: gsap.Context;

    const timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        // Reveal text
        container.querySelectorAll('.project-reveal-text').forEach((el) => {
          gsap.fromTo(el, { y: 100, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1, ease: 'power4.out',
            scrollTrigger: { trigger: el, scroller: container, start: 'top 90%' }
          });
        });

        // Parallax images
        container.querySelectorAll('.project-parallax-img').forEach((img) => {
          gsap.fromTo(img, { scale: 1.2, y: -50 }, {
            scale: 1, y: 50, ease: 'none',
            scrollTrigger: { trigger: img.parentElement, scroller: container, start: 'top bottom', end: 'bottom top', scrub: true }
          });
        });
      }, revealContainerRef);
      ScrollTrigger.refresh();
    }, 100);

    // Smooth scroll for the project container
    const lenis = new Lenis({
      wrapper: container,
      content: container.querySelector('.project-scroll-content') as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      clearTimeout(timeoutId);
      ctx?.revert();
      lenis.destroy();
    };
  }, [activeProject]);

  const projects = [
    { 
      id: 1, 
      title: 'SUZHOU HOUSE', 
      category: 'SUZHOU, CHINA', 
      year: '2021', 
      img: '/640.png', 
      heroImg: '/640 (7).png',
      split: 'col-span-12 md:col-span-7',
      description: 'The millennium-long allure of the East and the Western essence of modern design flow together as one, crossing the boundaries of culture, time, and space',
      details: [
  '/640 (6).png',
  '/640.webp',
  '/640.jpg',
  '/suzhou-dining.png',
  '/suzhou-console.png',
  '/suzhou-bedroom.png',
  '/IMG_0548.jpeg'
]
    },
    { 
      id: 2, 
      title: 'WATERBRIDGE HOUSE', 
      category: 'PEBBLE BEACH, CALIFORNIA', 
      year: '2025', 
      img: '/898bf0d613e24f5db255a14005355ef9.jpeg', 
      heroImg: '/3159 Stevenson Dr Reshoot-2.jpeg',
      split: 'col-span-12 md:col-span-5',
      featuredLogo: '/assets/aistudio/62ccb7b765d5ab23004e42d1_AmBD_Architecture_Logo_b8f7687c.svg',
      description: 'Waterbridge House began with my memory of a garden pavilion in Suzhou, China. In Pebble Beach, I arranged the main house, guest house and tea house around a reflecting pond. A glass bridge crosses the water between the living spaces and the private wing. From the kitchen, the view reaches through the pines to the Pacific. At the tea house, stepping stones lead across the water to a quiet place apart.',      details: [
        '/3159 Stevenson Drive, Pebble Beach.mp4',
        '/3159 Stevenson Dr Reshoot-7.jpeg',
        '/5544_41.webp',
        '/3159 Stevenson Dr-15.jpeg',
        '/3159 Stevenson Dr-9.jpeg',
        '/assets/aistudio/5544_60_09e97bd1.webp',
        '/assets/aistudio/5544_18_cedb2df6.webp',
        '/assets/aistudio/5544_2_86b16b38.webp',
        '/assets/aistudio/5544_33_2b10a11e.webp'
      ]
    },
    { 
      id: 3, 
      title: 'SPYGLASS GARDENS HOUSE', 
      category: 'PEBBLE BEACH, CALIFORNIA', 
      year: '2025', 
      img: '/2949_18.jpeg', 
      heroImg: '/2949_3.jpeg',
      split: 'col-span-12 md:col-span-4',
      description: 'Spyglass Garden House sits in Del Monte Forest beside the fairways of Spyglass Hill. I designed the house for gatherings that could move easily between the living spaces and the garden. Drawing on Japanese design, I kept the lines simple and the palette quiet so the eye would settle on the landscape. As in the other homes in my Pond Series, the pond gives the garden a different character as the light changes throughout the day.',
      details: [
        '/spyglass_garden_house,_pebble_beach___luxury_vacation_rental (1080p) (1).mp4',
        '/2949_19.jpeg',
        '/2949_1.jpeg',
        '/2949.jpeg',
        '/2949_4.jpeg',
        '/2949_5.jpeg',
        '/assets/aistudio/sg_4_7d43b5e4.webp',
        '/assets/aistudio/sg_3_b7cbe13d.webp',
        '/assets/aistudio/sg_2_dcd0ba72.webp',
        '/assets/aistudio/sg_1_a30be47c.webp'
      ]
    },
    { 
      id: 4, 
      title: 'IKENIWA', 
      category: 'CARMEL-BY-THE-SEA, CALIFORNIA', 
      year: '2025', 
      img: '/2923_6.jpg', 
      heroImg: '/2923.jpg',
      split: 'col-span-12 md:col-span-8',
      description: 'Ikeniwa means “pond garden” in Japanese. I drew on historic Asian gardens and the work of I. M. Pei to design this Carmel home around a central pond. Upstairs, the living room opens onto a terrace overlooking Carmel Bay. Downstairs, the main bedroom opens directly onto the pond garden. A desk in the guest bedroom looks out over the water. Maple and cherry trees fill the courtyards, where three stone lion heads sit among the Japanese dry gardens.',
      details: [
        '/welcome_to_ikeniwa (1080p) (1).mp4',
        '/681e30243a1d2c3e3b0891136fa65916.jpeg',
        '/9cc94aaabed54793254cbf805ba02a5c.jpeg',
        '/5dbba78affb272558cb6f5eb893a174a.jpeg',
        '/02b896f3d3e22689f939694e3cd7c62a.jpeg',
        '/ff602f98b71f12e27713377500d76b84.jpeg',
        '/assets/aistudio/i_3_be67d265.webp',
        '/assets/aistudio/i_1_0d871c60.webp',
        '/assets/aistudio/i_2_11857dff.webp'
      ]
    },
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#1A1A1A] min-h-screen selection:bg-[#1A1A1A] selection:text-[#FFFFFF]">
      <CustomCursor />

      {/* Header */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex justify-between items-center transition-all duration-300 ${
          isPastHero
            ? 'py-4 bg-white/95 backdrop-blur-md text-[#1A1A1A] border-b border-[#1A1A1A]/10'
            : 'py-6 bg-transparent text-white'
        }`}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen(false);
            lenisRef.current?.scrollTo(0, { duration: 1.2 });
          }}
          className="font-sans text-lg sm:text-xl md:text-2xl font-medium tracking-tight uppercase whitespace-nowrap shrink-0"
        >
          Emily Yang Bauer
        </a>
        <nav className="hidden md:flex items-center gap-8 font-sans text-xs tracking-widest uppercase">
          <Magnetic>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, '#about')}
              className={`whitespace-nowrap shrink-0 transition-opacity duration-200 ${
                isPastHero ? 'hover:text-[#888888]' : 'hover:opacity-75'
              }`}
            >
              About
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#work"
              onClick={(e) => scrollToSection(e, '#work')}
              className={`whitespace-nowrap shrink-0 transition-opacity duration-200 ${
                isPastHero ? 'hover:text-[#888888]' : 'hover:opacity-75'
              }`}
            >
              Work
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, '#contact')}
              className={`whitespace-nowrap shrink-0 transition-opacity duration-200 ${
                isPastHero ? 'hover:text-[#888888]' : 'hover:opacity-75'
              }`}
            >
              Contact
            </a>
          </Magnetic>
        </nav>
        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 -mr-2 transition-opacity hover:opacity-75"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className={`fixed inset-x-0 top-0 z-40 pt-24 pb-8 px-6 md:hidden transition-colors duration-300 ${
            isPastHero
              ? 'bg-white/95 backdrop-blur-md text-[#1A1A1A] border-b border-[#1A1A1A]/10'
              : 'bg-[#1A1A1A]/90 backdrop-blur-md text-white'
          }`}
        >
          <nav className="flex flex-col gap-6 font-sans text-sm tracking-widest uppercase">
            <a href="#about" onClick={(e) => scrollToSection(e, '#about')} className="py-1">
              About
            </a>
            <a href="#work" onClick={(e) => scrollToSection(e, '#work')} className="py-1">
              Work
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, '#contact')} className="py-1">
              Contact
            </a>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section
        ref={heroSectionRef}
        className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-[#1A1A1A]"
      >
        <img
          src="/2949_17.jpeg"
          alt="Minimalist architectural pavilion framed by pine trees at dusk"
          className="hero-parallax-img w-full h-full object-cover object-[50%_55%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 via-black/25 to-transparent"
        />
      </section>

      {/* About Designer Section */}
      <section id="about" className="px-6 md:px-12 pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          <div className="md:col-span-5 md:col-start-2 order-2 md:order-1">
            <div className="overflow-hidden relative aspect-[3/4] bg-[#EAEAEA]">
              <img 
                src="/IMG_1614-1.jpeg" 
                alt="Lead Designer"
                className="w-full h-full object-cover parallax-img"
              />
            </div>
          </div>
          <div className="md:col-span-5 md:col-start-7 order-1 md:order-2 flex flex-col justify-center">
            <div className="overflow-hidden mb-6">
              <p className="reveal-text font-sans text-xs tracking-widest uppercase text-[#888888]">The Designer</p>
            </div>
            <div className="overflow-hidden mb-8">
              <h2 className="reveal-text font-sans font-normal text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-normal uppercase text-[#1A1A1A]">
                Designing with Nature in Mind
              </h2>
            </div>
            <div className="overflow-hidden">
              <p className="reveal-text font-sans text-sm md:text-base font-normal leading-relaxed tracking-wide text-[#888888] max-w-lg">
                My work draws on the water gardens of Suzhou, traditional Chinese courtyard homes, and the simplicity of Scandinavian and Japanese design. I pay close attention to how rooms connect to gardens, how views unfold as you move through a home, and where an open space can offer a moment of quiet. I want the homes I design to feel connected to their surroundings and comfortable to live in every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid (Asymmetrical Masonry) */}
      <section id="work" className="px-6 md:px-12 pt-12 md:pt-16 pb-24">
        <div className="mb-16 md:mb-24 flex justify-between items-end border-b-2 border-[#1A1A1A] pb-8">
          <div className="overflow-hidden">
            <h2 className="reveal-text font-sans font-normal text-4xl md:text-6xl tracking-normal uppercase text-[#1A1A1A]">
              Works
            </h2>
          </div>

        </div>
        <div className="grid grid-cols-12 gap-6 md:gap-12">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className={`${project.split}`}
            >
              <div 
                className="group cursor-pointer"
                data-cursor="view"
                onClick={() => handleProjectClick(project)}
              >
                <div className="overflow-hidden relative aspect-[4/5] md:aspect-[3/4] bg-[#EAEAEA]">
                  <img 
                    src={project.img} 
                    alt={project.title}
                    className="w-full h-full object-cover parallax-img transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {project.featuredLogo && (
                    <div className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2.5 w-fit max-w-[calc(100%-2rem)] bg-[#F9F9F9]/85 backdrop-blur-sm px-3 py-[10px] rounded-[4px]">
                      <span className="font-sans text-xs leading-none text-[#333333] whitespace-nowrap">
                        Featured on
                      </span>
                      <img
                        src={project.featuredLogo}
                        alt="America By Design Architecture"
                        className="w-[84px] h-auto object-contain shrink-0"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between items-start">
                  <div>
                    <h3 className="font-sans font-normal text-3xl md:text-4xl uppercase">{project.title}</h3>
                    <p className="font-sans text-xs tracking-widest uppercase mt-2 text-[#C0C0C0]">{project.category}</p>
                  </div>
                  <span className="font-sans text-xs tracking-widest">{project.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* News Section */}
<section
  id="news"
  aria-labelledby="news-heading"
  className="eyb-news scroll-mt-24 bg-white px-6 md:px-12 pt-12 md:pt-16 pb-24 md:pb-32"
>
  <style>{`
    .eyb-news .news-card {
      position: relative;
      display: block;
      min-width: 0;
      color: #1a1a1a;
      text-decoration: none;
    }

    .eyb-news .news-card:focus-visible {
      outline: 2px solid #1a1a1a;
      outline-offset: 6px;
    }

    .eyb-news .news-media {
      position: relative;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      background: #f3f3f1;
    }

    .eyb-news .news-image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 600ms ease;
    }

    .eyb-news .news-publication {
      object-fit: contain;
      padding: clamp(1rem, 2vw, 2rem);
    }

    .eyb-news .news-play {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: opacity 250ms ease;
    }

    .eyb-news .news-panel {
      padding: 1.25rem 0 0;
    }

    .eyb-news .news-source {
      margin: 0 0 0.75rem;
      font-size: 0.6875rem;
      line-height: 1.6;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #666;
    }

    .eyb-news .news-title {
      margin: 0;
      max-width: 22ch;
      font-size: clamp(1.375rem, 2.2vw, 2rem);
      font-weight: 400;
      line-height: 1.2;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }

    .eyb-news .news-detail {
      margin: 0.875rem 0 0;
      font-size: 0.8125rem;
      line-height: 1.6;
      color: #666;
    }

    .eyb-news .news-action {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-bottom: 0.375rem;
      border-bottom: 1px solid #1a1a1a;
      font-size: 0.6875rem;
      line-height: 1.5;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    @media (min-width: 768px) and (hover: hover) and (pointer: fine) {
      .eyb-news .news-panel {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: clamp(1.25rem, 3vw, 3rem);
        background: rgba(255, 255, 255, 0.95);
        text-align: center;
        opacity: 0;
        transition: opacity 250ms ease;
        pointer-events: none;
      }

      .eyb-news .news-card:hover .news-panel,
      .eyb-news .news-card:focus-visible .news-panel {
        opacity: 1;
      }

      .eyb-news .news-card:hover .news-image {
        transform: scale(1.025);
      }

      .eyb-news .news-card:hover .news-play,
      .eyb-news .news-card:focus-visible .news-play {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .eyb-news .news-image,
      .eyb-news .news-panel,
      .eyb-news .news-play {
        transition: none;
      }

      .eyb-news .news-card:hover .news-image {
        transform: none;
      }
    }
  `}</style>

  <div className="mb-12 md:mb-16 border-b-2 border-[#1A1A1A] pb-8">
    <h2
      id="news-heading"
      className="font-sans font-normal text-4xl md:text-6xl tracking-normal uppercase text-[#1A1A1A]"
    >
      News
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-x-6 md:gap-x-12 gap-y-12 md:gap-y-16">
    {[
      {
        id: 'america-article',
        source: 'America ByDESIGN',
        title: 'Waterbridge House',
        detail: 'Project feature',
        action: 'Read the story',
        href: 'https://www.bydesign.global/america-features/waterbridge-house',
        image: '/3159 Stevenson Dr Reshoot-2.jpeg',
        alt: 'Waterbridge House framed by pine trees',
        layout: 'md:col-span-7',
        publication: false,
        video: false,
      },
      {
        id: '65-magazine',
        source: '65° Magazine',
        title: 'Designing with Nature in Mind',
        detail: 'Pages 55–59',
        action: 'Read the magazine',
        href: 'https://heyzine.com/flip-book/4bafb1a4d5.html',
        image: '/65_news.png',
        alt: 'Designing with Nature in Mind magazine spread',
        layout: 'md:col-span-5 md:mt-16',
        publication: true,
        video: false,
      },
      {
        id: 'poltrona-frau',
        source: 'Poltrona Frau',
        title: 'Poltrona Frau in homes of the world',
        detail: 'Lookbook 2024 · Pages 18–25',
        action: 'Explore the lookbook',
        href: 'https://www.poltronafrau.com/content/dam/ld/poltronafrau/catalogs/home-night/PF_look-book_2024.pdf#page=18',
        image: '/news-poltrona-frau.png',
        alt: 'Poltrona Frau 2024 lookbook cover',
        layout: 'md:col-span-5',
        publication: true,
        video: false,
      },
      {
        id: 'america-film',
        source: 'America ByDESIGN · YouTube',
        title: 'Waterbridge House, on film',
        detail: 'Watch the feature',
        action: 'Play the film',
        href: 'https://www.youtube.com/watch?v=3a1A1Hcbs5w&t=97s',
        image: '/3159 Stevenson Dr Reshoot-7.jpeg',
        alt: 'A view of Waterbridge House',
        layout: 'md:col-span-7 md:mt-16',
        publication: false,
        video: true,
      },
    ].map((item) => (
      <a
        key={item.id}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.source}: ${item.title}. ${item.detail}. Opens in a new tab.`}
        className={`news-card font-sans ${item.layout}`}
      >
        <div className="news-media">
          <img
            src={item.image}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className={`news-image ${
              item.publication ? 'news-publication' : ''
            }`}
          />

          {item.video && (
            <div className="news-play" aria-hidden="true">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-black/25 text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M8 5L19 12L8 19V5Z" />
                </svg>
              </span>
            </div>
          )}
        </div>

        <div className="news-panel">
          <p className="news-source">{item.source}</p>
          <h3 className="news-title">{item.title}</h3>
          <p className="news-detail">{item.detail}</p>

          <span className="news-action">
            {item.action}
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
      </a>
    ))}
  </div>
</section>
      {/* Inquiry Footer */}
      <section id="contact" className="bg-[#1A1A1A] text-[#F9F9F9] px-6 md:px-12 pt-16 pb-24 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-2xl md:text-3xl font-light tracking-wide text-[#F9F9F9]">
              Inquiries
            </h2>
            <div className="flex flex-col gap-2">
              <a 
                href="mailto:emilyyyangbauer@gmail.com" 
                className="font-sans text-sm tracking-wider text-[#A0A0A0] hover:text-[#F9F9F9] transition-colors w-fit"
              >
                emilyyyangbauer@gmail.com
              </a>
              <a 
                href="tel:8319177353" 
                className="font-sans text-sm tracking-wider text-[#A0A0A0] hover:text-[#F9F9F9] transition-colors w-fit"
              >
                831.917.7353
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="font-sans text-xs tracking-widest text-[#666666] uppercase">© 2026 Emily Yang Bauer. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </section>

      {/* Signature Reveal Overlay (Suzhou House Logic) */}
      <div 
        ref={revealContainerRef}
        className="fixed inset-0 z-[100] hidden bg-[#FFFFFF] overflow-y-auto overflow-x-hidden"
      >
        <div className="project-scroll-content">
          {/* Project Hero Banner */}
{/* Project Hero Banner */}
<div
  className={`project-detail-hero ${
    activeProject?.title === 'WATERBRIDGE HOUSE'
      ? 'waterbridge-hero'
      : ''
  }`}
>
  <style>{`
    .project-detail-hero {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: #1a1a1a;
      flex-shrink: 0;
    }

    .project-detail-hero .hero-shade {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      pointer-events: none;
    }

    .waterbridge-hero .hero-shade {
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.08) 20%,
        rgba(0, 0, 0, 0.25) 45%,
        rgba(0, 0, 0, 0.8) 100%
      );
    }

    .project-detail-hero .hero-content {
      position: relative;
      z-index: 20;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 2.5rem;
      min-height: max(100svh, 40rem);
      padding: 8rem clamp(1.5rem, 4vw, 4rem)
        max(2.5rem, env(safe-area-inset-bottom));
      color: white;
    }

    .project-detail-hero .hero-quote {
      margin: 0;
      width: 100%;
      max-width: 34rem;
    }

    .project-detail-hero .hero-quote p {
      margin: 0;
      font-size: clamp(1.5rem, 3vw, 1.875rem);
      line-height: 1.3;
      font-weight: 400;
      text-wrap: pretty;
    }

    .project-detail-hero .hero-quote footer {
      margin-top: 1rem;
      font-size: 0.75rem;
      line-height: 1.5;
      letter-spacing: 0.08em;
    }

    .project-detail-hero .hero-bottom {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.5rem 2rem;
    }

    .project-detail-hero .hero-location {
      flex: 1 1 14rem;
      min-width: 0;
    }

    .project-detail-hero .hero-scroll {
      flex-shrink: 0;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    @media (min-width: 1200px) and (min-aspect-ratio: 3/2) {
      .waterbridge-hero .hero-shade {
        background: rgba(0, 0, 0, 0.08);
      }

      .waterbridge-hero .hero-content {
        padding-top: max(7rem, 22svh);
        padding-left: 5%;
        padding-right: 5%;
      }

      .waterbridge-hero .hero-quote {
        align-self: flex-end;
        width: 27%;
        max-width: 26.25rem;
        color: #1a1a1a;
      }

      .waterbridge-hero .hero-quote p {
        font-size: clamp(1.5rem, 1.65vw, 1.875rem);
      }

      .waterbridge-hero .hero-bottom {
        margin-top: auto;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
      }
    }
  `}</style>

  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      ref={revealImageRef}
      src={activeProject?.heroImg || activeProject?.img}
      alt={activeProject?.title || 'Project hero'}
      className="w-full h-full object-cover opacity-0 scale-110"
    />
    <div className="hero-shade" aria-hidden="true" />
  </div>

  {/* Close Button */}
  <button
    type="button"
    onClick={closeProject}
    className="fixed top-4 right-4 md:top-8 md:right-8 z-50
      min-h-11 px-4 bg-black/40 text-white font-sans text-xs
      tracking-widest uppercase hover:bg-black/60 transition-colors
      focus-visible:outline focus-visible:outline-2
      focus-visible:outline-offset-4 focus-visible:outline-white"
  >
    Close
  </button>

  {/* Split Text Container */}
  <div className="absolute inset-0 z-10 pointer-events-none">
    {/* Top Half */}
    <div
      ref={revealTopRef}
      className="absolute inset-0 flex items-center justify-center"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
      }}
    >
      <h2
        className="font-sans font-normal leading-none tracking-normal
          text-white whitespace-nowrap uppercase w-full text-center"
        style={{
          fontSize: `calc(130vw / ${Math.max(
            activeProject?.title?.length || 1,
            1
          )})`,
        }}
      >
        {activeProject?.title}
      </h2>
    </div>

    {/* Bottom Half */}
    <div
      ref={revealBottomRef}
      className="absolute inset-0 flex items-center justify-center"
      style={{
        clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
      }}
    >
      <h2
        className="font-sans font-normal leading-none tracking-normal
          text-white whitespace-nowrap uppercase w-full text-center"
        style={{
          fontSize: `calc(130vw / ${Math.max(
            activeProject?.title?.length || 1,
            1
          )})`,
        }}
      >
        {activeProject?.title}
      </h2>
    </div>
  </div>

  {/* Quote and Project Information */}
  <div className="hero-content">
    {activeProject?.title === 'WATERBRIDGE HOUSE' && (
      <blockquote
  className="hero-quote"
  style={{ opacity: 0 }}
>
        <p className="font-serif">
          “In a place that’s known for its bold statements, this
          property might be the boldest move of all.”
        </p>
        <footer className="font-sans">
          — <span className="italic">America ByDESIGN</span>
        </footer>
      </blockquote>
    )}

    <div className="hero-bottom">
      <div className="hero-location">
        <p
          className="project-hero-info font-sans text-sm
            leading-relaxed tracking-widest uppercase mb-2"
        >
          {activeProject?.category}
        </p>
        <p className="project-hero-info font-sans text-xs tracking-widest">
          {activeProject?.year}
        </p>
      </div>

      <span className="hero-scroll project-hero-info font-sans">
        Scroll Down ↓
      </span>
    </div>
  </div>
</div>

        {/* Scrollable Project Details */}
        <div className="w-full bg-[#FFFFFF] text-[#1A1A1A] px-6 md:px-12 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
              <div className="overflow-hidden md:w-1/3">
                <h3 className="project-reveal-text font-sans text-3xl md:text-5xl uppercase">About the Project</h3>
              </div>
              <div className="overflow-hidden md:w-2/3">
                <p className="project-reveal-text font-sans text-lg md:text-xl leading-relaxed text-[#888888]">
                  {activeProject?.description}
                </p>
              </div>
            </div>
         {/* Waterbridge House — America ByDESIGN Feature */}
{activeProject?.title === 'WATERBRIDGE HOUSE' && (
  <section
    aria-labelledby="waterbridge-feature-title"
    className="mb-16 md:mb-24 border-y border-[#1A1A1A]/15 py-8 md:py-10"
  >
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
      <h3
        id="waterbridge-feature-title"
        className="min-w-0 font-sans font-normal text-2xl md:text-3xl leading-tight tracking-tight text-[#1A1A1A] max-w-lg"
      >
        A closer look at Waterbridge House.
      </h3>

      <div className="flex flex-col items-center gap-5 w-full sm:w-fit lg:shrink-0">
        <div className="flex items-center justify-center gap-4">
          <span className="font-sans text-[11px] tracking-[0.18em] uppercase text-[#666666]">
            Featured on
          </span>

          {activeProject.featuredLogo && (
            <img
              src={activeProject.featuredLogo}
              alt="America ByDESIGN"
              className="w-[100px] h-auto object-contain"
              loading="lazy"
            />
          )}
        </div>

        <a
          href="https://www.youtube.com/watch?v=3a1A1Hcbs5w&t=97s"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch the Waterbridge House feature on YouTube (opens in a new tab)"
          className="group inline-flex w-full items-center justify-center gap-5 min-h-12 px-6 py-4 bg-[#1A1A1A] text-white font-sans text-xs tracking-widest uppercase transition-colors duration-200 hover:bg-[#363636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A1A1A]"
        >
          <span>Watch the feature</span>
          <ArrowUpRight
            size={18}
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </div>
  </section>
)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-24">
              {activeProject?.details?.map((item: string, idx: number) => {
                const isVideo = item.endsWith('.mp4');
                const isFullWidth = isVideo || (idx === 2 && activeProject.details.length === 3);

                if (isFullWidth) {
                  return (
                    <div key={idx} className="col-span-1 md:col-span-2 aspect-video w-full bg-[#EAEAEA] overflow-hidden">
                      {isVideo ? (
                        <video src={item} autoPlay loop muted playsInline controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={item} className="w-full h-full object-cover project-parallax-img" alt={`Detail ${idx + 1}`} />
                      )}
                    </div>
                  );
                }

                const hasFirstVideo = activeProject.details[0]?.endsWith('.mp4');
                const isRightColumn = hasFirstVideo ? idx % 2 === 0 : idx % 2 !== 0;
                const isLandscapeProject = activeProject?.title === 'IKENIWA' || activeProject?.title === 'SPYGLASS GARDENS HOUSE' || activeProject?.title === 'WATERBRIDGE HOUSE';

                return (
                  <div key={idx} className={`${isLandscapeProject ? 'aspect-[3/2]' : 'aspect-[4/5]'} bg-[#EAEAEA] overflow-hidden ${isRightColumn ? 'mt-0 md:mt-24' : ''}`}>
                    <img src={item} className="w-full h-full object-cover project-parallax-img" alt={`Detail ${idx + 1}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
