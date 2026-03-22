import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUpRight, Menu } from 'lucide-react';

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
  const headerRef = useRef<HTMLDivElement>(null);
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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Header Scroll Logic
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!headerRef.current) return;
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            gsap.to(headerRef.current, { 
              y: '-100%', 
              duration: 0.3, 
              ease: 'power3.out',
              overwrite: true
            });
          } else {
            gsap.to(headerRef.current, { 
              y: '0%', 
              paddingTop: currentScrollY > 50 ? '1rem' : '1.5rem',
              paddingBottom: currentScrollY > 50 ? '1rem' : '1.5rem',
              duration: 0.3, 
              ease: 'power3.out',
              backgroundColor: currentScrollY > 50 ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
              backdropFilter: currentScrollY > 50 ? 'blur(16px)' : 'none',
              overwrite: true
            });
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      description: 'A minimalist estate compound in Pebble Beach that blends Scandinavian and Japanese design influences, featuring a glass-enclosed passage over a tranquil pond that connects the residence\'s public and private wings.',
      details: [
        '/Waterbridge (1).mp4',
        '/3159 Stevenson Dr Reshoot-7.jpeg',
        '/3159 Stevenson Dr Reshoot-6.jpeg',
        '/3159 Stevenson Dr-15.jpeg',
        '/3159 Stevenson Dr-9.jpeg'
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
      description: 'Deeply rooted in the heritage of Suzhou, this Pebble Beach retreat integrates a 3,000-year-old water garden tradition into a high-functioning forest residence.',
      details: [
        '/spyglass_garden_house,_pebble_beach___luxury_vacation_rental (1080p) (1).mp4',
        '/2949_19.jpeg',
        '/2949_1.jpeg',
        '/2949.jpeg',
        '/2949_4.jpeg',
        '/2949_5.jpeg'
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
      description: 'Drawing inspiration from the gardens of Suzhou and the architectural philosophy of I.M. Pei, Ikeniwa blends modern minimalism with the heritage of Japanese stroll gardens and Suzhou classical design.',
      details: [
        '/welcome_to_ikeniwa (1080p) (1).mp4',
        '/681e30243a1d2c3e3b0891136fa65916.jpeg',
        '/9cc94aaabed54793254cbf805ba02a5c.jpeg',
        '/5dbba78affb272558cb6f5eb893a174a.jpeg',
        '/02b896f3d3e22689f939694e3cd7c62a.jpeg',
        '/ff602f98b71f12e27713377500d76b84.jpeg'
      ]
    },
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#1A1A1A] min-h-screen selection:bg-[#1A1A1A] selection:text-[#FFFFFF]">
      <CustomCursor />

      {/* Header */}
      <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="font-sans text-2xl font-medium tracking-tight uppercase">Emily Yang Bauer</div>
        <nav className="hidden md:flex gap-8 font-sans text-xs tracking-widest uppercase">
          <Magnetic><a href="#about" className="hover:text-[#C0C0C0] transition-colors">About</a></Magnetic>
          <Magnetic><a href="#work" className="hover:text-[#C0C0C0] transition-colors">Work</a></Magnetic>
          <Magnetic><a href="#contact" className="hover:text-[#C0C0C0] transition-colors">Contact</a></Magnetic>
        </nav>
        <Magnetic>
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </Magnetic>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6 md:px-12">
        <div className="w-full h-[2px] bg-[#1A1A1A] mb-12"></div>
        <div className="overflow-hidden mb-12">
          <h1 className="reveal-text font-sans text-[10vw] leading-[1.1] tracking-tighter uppercase font-bold text-[#222222]">
            SPACE, LIGHT, AND THE GARDEN
          </h1>
        </div>

        <div className="w-full aspect-[4/3] md:aspect-[3/2] bg-[#EAEAEA] overflow-hidden">
          <img 
            src="/2949_17.jpeg" 
            alt="Futuristic Architecture"
            className="w-full h-full object-cover parallax-img"
          />
        </div>
      </section>

      {/* About Designer Section */}
      <section id="about" className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="w-full h-[2px] bg-[#1A1A1A] mb-24 md:mb-32"></div>
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
                HARMONIZING HERITAGE WITH MODERN MINIMALISM
              </h2>
            </div>
            <div className="overflow-hidden mb-12">
              <p className="reveal-text font-sans text-sm md:text-base font-normal leading-relaxed tracking-wide text-[#888888] max-w-lg">
                I approach every project as a dialogue between architectural legacy and the surrounding environment. Drawing inspiration from the traditional water gardens of Suzhou, I harmonize traditional Chinese private compound principles with the understated functionality of Scandinavian-Japanese minimalism. By embracing the intentional use of negative space, I design highly functional estates that reveal and conceal, fostering an interplay between contemporary forms and natural elements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid (Asymmetrical Masonry) */}
      <section id="work" className="px-6 md:px-12 py-24">
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
        <div className="relative w-full h-screen flex-shrink-0 bg-[#1A1A1A] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              ref={revealImageRef}
              src={activeProject?.heroImg || activeProject?.img} 
              alt="Project Hero" 
              className="w-full h-full object-cover opacity-0 scale-110"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Close Button */}
          <button 
            onClick={closeProject}
            className="fixed top-8 right-8 z-50 text-white font-sans text-xs tracking-widest uppercase mix-blend-difference hover:opacity-70 transition-opacity"
          >
            Close
          </button>

          {/* Split Text Container */}
          <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
            {/* Top Half */}
            <div 
              ref={revealTopRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
            >
              <h2 
                className="font-sans font-normal leading-none tracking-normal text-[#FFFFFF] whitespace-nowrap uppercase w-full text-center"
                style={{ fontSize: `calc(130vw / ${Math.max(activeProject?.title?.length || 1, 1)})` }}
              >
                {activeProject?.title}
              </h2>
            </div>

            {/* Bottom Half */}
            <div 
              ref={revealBottomRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
            >
              <h2 
                className="font-sans font-normal leading-none tracking-normal text-[#FFFFFF] whitespace-nowrap uppercase w-full text-center"
                style={{ fontSize: `calc(130vw / ${Math.max(activeProject?.title?.length || 1, 1)})` }}
              >
                {activeProject?.title}
              </h2>
            </div>
          </div>

          {/* Project Info (Revealed after split) */}
          <div className="absolute bottom-12 left-12 z-20 text-white mix-blend-difference">
            <p className="project-hero-info font-sans text-sm tracking-widest uppercase mb-2">{activeProject?.category}</p>
            <p className="project-hero-info font-sans text-xs tracking-widest text-[#C0C0C0]">{activeProject?.year}</p>
          </div>
          <div className="absolute bottom-12 right-12 z-20 text-white mix-blend-difference animate-bounce">
             <span className="project-hero-info font-sans text-xs tracking-widest uppercase">Scroll Down ↓</span>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-24">
              {activeProject?.details?.map((item: string, idx: number) => {
                const isVideo = item.endsWith('.mp4');
                const isFullWidth = isVideo || (idx === 2 && activeProject.details.length === 3);

                if (isFullWidth) {
                  return (
                    <div key={idx} className="col-span-1 md:col-span-2 aspect-video w-full bg-[#EAEAEA] overflow-hidden">
                      {isVideo ? (
                        <video src={item} autoPlay loop muted playsInline controls className="w-full h-full object-cover project-parallax-img" />
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
