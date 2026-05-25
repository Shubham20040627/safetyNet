import React, { useEffect, useRef, useState } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const { locale = 'en', translations = {} } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    // Typewriter effect state
    const [typedText, setTypedText] = useState(translations.typewriter_1 || 'Stay Alert');
    const words = [
        translations.typewriter_1 || 'Stay Alert',
        translations.typewriter_2 || 'Stay Safe',
        translations.typewriter_3 || 'Protect Together',
        translations.typewriter_4 || 'Connected Communities'
    ];
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                setTypedText(currentWord.substring(0, typedText.length - 1));
                setTypingSpeed(50);
            } else {
                setTypedText(currentWord.substring(0, typedText.length + 1));
                setTypingSpeed(120);
            }

            if (!isDeleting && typedText === currentWord) {
                setTypingSpeed(2500);
                setIsDeleting(true);
            } else if (isDeleting && typedText === '') {
                setIsDeleting(false);
                setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
                setTypingSpeed(200);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [typedText, isDeleting, wordIndex, typingSpeed]);

    // Network constellation background canvas effect
    useEffect(() => {
        const canvas = document.getElementById('network-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        let width = (canvas.width = canvas.parentElement.offsetWidth);
        let height = (canvas.height = canvas.parentElement.offsetHeight);

        const resizeCanvas = () => {
            if (canvas && canvas.parentElement) {
                width = canvas.width = canvas.parentElement.offsetWidth;
                height = canvas.height = canvas.parentElement.offsetHeight;
            }
        };
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const particleCount = 45;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                radius: Math.random() * 2 + 1
            });
        }

        let mouseX = null;
        let mouseY = null;

        const handleMouseMoveCanvas = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };
        
        const handleMouseLeaveCanvas = () => {
            mouseX = null;
            mouseY = null;
        };

        window.addEventListener('mousemove', handleMouseMoveCanvas);
        document.addEventListener('mouseleave', handleMouseLeaveCanvas);

        const draw = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
            ctx.strokeStyle = 'rgba(79, 70, 229, 0.03)';

            for (let i = 0; i < particleCount; i++) {
                const p1 = particles[i];
                p1.x += p1.vx;
                p1.y += p1.vy;

                if (p1.x < 0 || p1.x > width) p1.vx *= -1;
                if (p1.y < 0 || p1.y > height) p1.vy *= -1;

                if (mouseX !== null && mouseY !== null) {
                    const dx = p1.x - mouseX;
                    const dy = p1.y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const force = (120 - dist) / 120;
                        p1.x += (dx / dist) * force * 1.5;
                        p1.y += (dy / dist) * force * 1.5;
                    }
                }

                ctx.beginPath();
                ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particleCount; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMoveCanvas);
            document.removeEventListener('mouseleave', handleMouseLeaveCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const navRef = useRef(null);
    const progressRef = useRef(null);
    const dotRef = useRef(null);
    const outlineRef = useRef(null);
    const spotlightRef = useRef(null);

    // SVG Path drawing refs
    const scrollPathRef = useRef(null);
    const scrollPathTrackRef = useRef(null);
    const glowDotRef = useRef(null);

    useEffect(() => {
        const dot = dotRef.current;
        const outline = outlineRef.current;
        const spotlight = spotlightRef.current;
        const nav = navRef.current;
        const progress = progressRef.current;

        const handleMouseMove = (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            if (dot) dot.style.transform = `translate(${posX - 4}px, ${posY - 4}px)`;
            if (spotlight) {
                spotlight.style.left = posX + 'px';
                spotlight.style.top = posY + 'px';
            }
            if (outline) {
                outline.animate({
                    left: `${posX - 16}px`,
                    top: `${posY - 16}px`
                }, { duration: 500, fill: "forwards" });
            }

            // Mouse-following parallax
            const parallaxElements = document.querySelectorAll('.parallax-move');
            parallaxElements.forEach((el) => {
                const speed = parseFloat(el.getAttribute('data-parallax-speed') || '15');
                const x = (window.innerWidth / 2 - e.clientX) / speed;
                const y = (window.innerHeight / 2 - e.clientY) / speed;
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        const handleInteractiveEnter = () => {
            if (outline) {
                outline.style.transform = 'scale(2)';
                outline.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
                outline.style.borderColor = 'transparent';
            }
        };

        const handleInteractiveLeave = () => {
            if (outline) {
                outline.style.transform = 'scale(1)';
                outline.style.backgroundColor = 'transparent';
                outline.style.borderColor = '#818cf8';
            }
        };

        const interactiveElements = document.querySelectorAll('a, button, .group');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleInteractiveEnter);
            el.addEventListener('mouseleave', handleInteractiveLeave);
        });

        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            if (progress) progress.style.width = scrolled + "%";

            if (nav) {
                if (window.scrollY > 50) {
                    nav.classList.add('glass-nav', 'py-2');
                    nav.classList.remove('py-4');
                } else {
                    nav.classList.remove('glass-nav', 'py-2');
                    nav.classList.add('py-4');
                }
            }

            const parallaxImgs = document.querySelectorAll('.parallax-img');
            parallaxImgs.forEach(img => {
                let speed = 0.2;
                img.style.setProperty('--parallax-offset', (window.scrollY * speed) + 'px');
            });

            // SVG Path Drawing Scroll Effect
            const gridContainer = document.getElementById('features-grid-container');
            const scrollPath = scrollPathRef.current;
            const glowDot = glowDotRef.current;
            if (gridContainer && scrollPath) {
                const rect = gridContainer.getBoundingClientRect();
                const containerHeight = rect.height;
                const viewHeight = window.innerHeight;

                // Start drawing when the top of the grid enters the lower middle of the viewport
                const startThreshold = viewHeight * 0.75;
                const currentScroll = startThreshold - rect.top;
                const maxScrollRange = containerHeight + startThreshold - viewHeight * 0.25;

                let progress = currentScroll / maxScrollRange;
                progress = Math.max(0, Math.min(1, progress));

                try {
                    const pathLength = scrollPath.getTotalLength();
                    if (pathLength > 0) {
                        scrollPath.style.strokeDasharray = `${pathLength}`;
                        scrollPath.style.strokeDashoffset = `${pathLength * (1 - progress)}`;

                        if (glowDot) {
                            const point = scrollPath.getPointAtLength(pathLength * progress);
                            glowDot.setAttribute('cx', `${point.x}`);
                            glowDot.setAttribute('cy', `${point.y}`);
                            glowDot.setAttribute('opacity', progress > 0.01 && progress < 0.99 ? '1' : '0');
                        }
                    }
                } catch (e) {
                    // Suppress if path is not yet fully laid out or rendered
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        
        // Initial call
        handleScroll();

        const tiltCards = document.querySelectorAll('.tilt-card');
        const handleTiltMove = (e, card) => {
            const content = card.querySelector('div');
            if(!content) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;
            content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            content.style.boxShadow = '0 30px 60px -15px rgba(99, 102, 241, 0.25)';
        };
        const handleTiltLeave = (card) => {
            const content = card.querySelector('div');
            if(content) {
                content.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
                content.style.boxShadow = '';
            }
        };

        tiltCards.forEach(card => {
            const moveFn = (e) => handleTiltMove(e, card);
            const leaveFn = () => handleTiltLeave(card);
            card.addEventListener('mousemove', moveFn);
            card.addEventListener('mouseleave', leaveFn);
            card._moveFn = moveFn;
            card._leaveFn = leaveFn;
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            let delayCounter = 0;
            let lastEntryTime = 0;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const now = performance.now();
                    if (now - lastEntryTime < 80) {
                        delayCounter++;
                    } else {
                        delayCounter = 0;
                    }
                    lastEntryTime = now;
                    entry.target.style.transitionDelay = `${delayCounter * 120}ms`;
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            observer.observe(el);
        });

        // Magnetic button interactions
        const magneticElements = document.querySelectorAll('.btn-magnetic');
        magneticElements.forEach(el => {
            const handleMouseMoveMagnetic = (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Track relative position for glowing cursor tracking
                const btnX = e.clientX - rect.left;
                const btnY = e.clientY - rect.top;
                el.style.setProperty('--btn-mouse-x', `${btnX}px`);
                el.style.setProperty('--btn-mouse-y', `${btnY}px`);

                el.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0) scale(1.04)`;
            };
            const handleMouseLeaveMagnetic = () => {
                el.style.transform = '';
            };
            el.addEventListener('mousemove', handleMouseMoveMagnetic);
            el.addEventListener('mouseleave', handleMouseLeaveMagnetic);
            el._moveMagnetic = handleMouseMoveMagnetic;
            el._leaveMagnetic = handleMouseLeaveMagnetic;
        });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleInteractiveEnter);
                el.removeEventListener('mouseleave', handleInteractiveLeave);
            });
            tiltCards.forEach(card => {
                if(card._moveFn) card.removeEventListener('mousemove', card._moveFn);
                if(card._leaveFn) card.removeEventListener('mouseleave', card._leaveFn);
            });
            magneticElements.forEach(el => {
                if (el._moveMagnetic) el.removeEventListener('mousemove', el._moveMagnetic);
                if (el._leaveMagnetic) el.removeEventListener('mouseleave', el._leaveMagnetic);
            });
            observer.disconnect();
        };
    }, []);

    return (
        <div className="bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white w-full relative overflow-x-hidden">
            <Head title={translations.meta_title || "SafetyNet - Community Driven Security"} />
            
            <style>
                {`
                .glass-nav {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px border rgba(0, 0, 0, 0.05);
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-slow {
                    animation: float-slow 5s ease-in-out infinite;
                }
                .animate-float-medium {
                    animation: float-medium 4s ease-in-out infinite;
                }
                #scroll-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 0%;
                    height: 4px;
                    background: linear-gradient(to right, #4f46e5, #ec4899);
                    z-index: 1000;
                    transition: width 0.1s ease-out;
                }
                .btn-magnetic {
                    position: relative;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                }
                .btn-magnetic::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: radial-gradient(
                        80px circle at var(--btn-mouse-x, 0px) var(--btn-mouse-y, 0px),
                        rgba(99, 102, 241, 0.18),
                        transparent 80%
                    );
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                    z-index: 1;
                }
                .btn-magnetic:hover::before {
                    opacity: 1;
                }
                .btn-magnetic:hover { transform: scale(1.05) translateY(-2px); }
                .parallax-img {
                    transform: translateY(var(--parallax-offset, 0px));
                    transition: transform 0.1s ease-out;
                }
                .text-glow {
                    background: linear-gradient(to right, #1e293b, #4f46e5, #ec4899, #1e293b);
                    background-size: 300% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: textSweep 8s linear infinite;
                }
                @keyframes textSweep {
                    0% { background-position: 0% center; }
                    100% { background-position: 300% center; }
                }
                
                /* Advanced Border Glow Hover Interaction & Lighting Reflection */
                .tilt-card {
                    transform-style: preserve-3d;
                    perspective: 1000px;
                    position: relative;
                }
                .tilt-card > div {
                    position: relative;
                    transition: transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1), box-shadow 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
                }
                .tilt-card > div::before {
                    content: '';
                    position: absolute;
                    inset: 0px;
                    border-radius: inherit;
                    padding: 1.5px;
                    background: radial-gradient(250px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.4), transparent 70%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    z-index: 20;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }
                .tilt-card > div::after {
                    content: '';
                    position: absolute;
                    inset: 0px;
                    border-radius: inherit;
                    background: radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.07), transparent 75%);
                    pointer-events: none;
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }
                .tilt-card:hover > div::before, .tilt-card:hover > div::after {
                    opacity: 1;
                }

                .font-serif-custom { font-family: 'Merriweather', serif; }
                
                /* Apple/Stripe-Style Scroll Reveal */
                .reveal { opacity: 0; transform: translateY(30px) scale(0.98); transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1); }
                .reveal-right { opacity: 0; transform: translateX(30px); transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1); }
                .revealed { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
                
                /* Background glows with organic morphing bubbles */
                @keyframes morph-blob-1 {
                    0% {
                        transform: translate(0px, 0px) scale(1) rotate(0deg);
                        border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1) rotate(120deg);
                        border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%;
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.95) rotate(240deg);
                        border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1) rotate(360deg);
                        border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
                    }
                }
                @keyframes morph-blob-2 {
                    0% {
                        transform: translate(0px, 0px) scale(1) rotate(0deg);
                        border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
                    }
                    50% {
                        transform: translate(-45px, 50px) scale(1.12) rotate(-180deg);
                        border-radius: 35% 65% 55% 45% / 55% 45% 55% 45%;
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1) rotate(-360deg);
                        border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
                    }
                }
                .blob {
                    position: absolute; width: 500px; height: 500px;
                    background: linear-gradient(180deg, rgba(79, 70, 229, 0.08) 0%, rgba(147, 197, 253, 0.03) 100%);
                    filter: blur(90px); border-radius: 50%; z-index: -1; pointer-events: none;
                    animation: morph-blob-1 25s infinite ease-in-out;
                }
                .hero-glass-card {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .hero-glass-card:hover {
                    transform: scale(1.06) translateY(-4px) !important;
                    background-color: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(99, 102, 241, 0.5) !important;
                    box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.35), 0 0 20px 2px rgba(99, 102, 241, 0.2) !important;
                }
                .hero-glass-card-dark {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .hero-glass-card-dark:hover {
                    transform: scale(1.06) translateY(-4px) !important;
                    background-color: rgba(15, 23, 42, 0.6) !important;
                    border-color: rgba(99, 102, 241, 0.4) !important;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.55), 0 0 20px 2px rgba(99, 102, 241, 0.25) !important;
                }
                .btn-shimmer {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1), box-shadow 0.3s cubic-bezier(0.1, 0.9, 0.2, 1), background-color 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
                }
                .btn-shimmer::after {
                    content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg); animation: shimmer 4s infinite;
                }
                .btn-shimmer:hover {
                    transform: scale(1.03) translateY(-2px);
                    box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.3);
                }
                .btn-shimmer:active {
                    transform: scale(0.98) translateY(0);
                }
                @keyframes shimmer { 0% { left: -150%; } 100% { left: 150%; } }
                .progress-bar-fill { width: 0% !important; transition: width 1.5s cubic-bezier(0.1, 0.9, 0.2, 1); }
                .revealed .progress-bar-fill { width: var(--target-width) !important; }
                
                /* Shivering film grain animation */
                @keyframes noise-animation {
                    0% { transform: translate(0,0) }
                    10% { transform: translate(-0.5%,-0.5%) }
                    20% { transform: translate(-1%,0.5%) }
                    30% { transform: translate(0.5%,-1%) }
                    40% { transform: translate(-0.5%,1.5%) }
                    50% { transform: translate(-1%,0.5%) }
                    60% { transform: translate(1.5%,-0.5%) }
                    70% { transform: translate(1%,0.5%) }
                    80% { transform: translate(-1.5%,-1%) }
                    90% { transform: translate(0.5%,1%) }
                    100% { transform: translate(0,0) }
                }
                .noise-overlay {
                    position: fixed; top: -20%; left: -20%; width: 140%; height: 140%;
                    background: url('https://grainy-gradients.vercel.app/noise.svg');
                    opacity: 0.04; pointer-events: none; z-index: 9999;
                    animation: noise-animation 0.5s steps(5) infinite;
                }
                
                #spotlight {
                    position: fixed; top: 0; left: 0; width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 70%);
                    border-radius: 50%; pointer-events: none; z-index: -1; transform: translate(-50%, -50%);
                    transition: width 0.5s, height 0.5s;
                }
                
                /* Feature card image zoom */
                .group:hover img {
                    transform: scale(1.04) !important;
                }
                .group img {
                    transition: transform 2s cubic-bezier(0.1, 0.9, 0.2, 1) !important;
                }
                `}
            </style>

            <div className="noise-overlay"></div>
            <div id="spotlight" ref={spotlightRef}></div>

            <div className="blob top-[-100px] left-[-100px] opacity-60" style={{ animationName: 'morph-blob-1' }}></div>
            <div className="blob top-[300px] right-[-100px] bg-indigo-200/20" style={{animationDelay: '-5s', width: '600px', height: '600px', animationName: 'morph-blob-2'}}></div>
            <div className="blob bottom-[-200px] left-[-200px] bg-amber-100/30" style={{width: '800px', height: '800px', animationDelay: '-10s', animationName: 'morph-blob-1'}}></div>
            <div className="blob middle-0 right-[10%] bg-purple-100/20" style={{width: '400px', height: '400px', animationDelay: '-15s', animationName: 'morph-blob-2'}}></div>

            <div id="scroll-progress" ref={progressRef}></div>

            <div id="cursor-dot" ref={dotRef} className="fixed w-2 h-2 bg-indigo-600 rounded-full pointer-events-none z-[9999] transition-transform duration-100 ease-out"></div>
            <div id="cursor-outline" ref={outlineRef} className="fixed w-8 h-8 border border-indigo-400 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out flex items-center justify-center">
                <div className="w-1 h-1 bg-indigo-400 rounded-full opacity-0 cursor-plus transition-opacity"></div>
            </div>
            
            <header ref={navRef} id="main-nav" className="fixed w-full top-0 z-50 transition-all duration-300 py-4">
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">SafetyNet.</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-6">
                        {/* Language Switcher */}
                        <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur-md rounded-full p-1 border border-slate-200/65 text-[10.5px] font-extrabold select-none shadow-sm mr-1">
                            <span className="pl-2 pr-0.5 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 0 1 8.716 6.747M12 3a9.003 9.003 0 0 0-8.716 6.747M12 9h.008v.008H12V9ZM3.75 12h16.5" />
                                </svg>
                            </span>
                            <Link 
                                href={route('language.switch', 'en')} 
                                className={`px-3 py-1 rounded-full transition-all duration-200 ${locale === 'en' ? 'bg-slate-900 text-white shadow-sm scale-105' : 'text-slate-500 hover:text-slate-950'}`}
                            >
                                EN
                            </Link>
                            <Link 
                                href={route('language.switch', 'hi')} 
                                className={`px-3 py-1 rounded-full transition-all duration-200 ${locale === 'hi' ? 'bg-slate-900 text-white shadow-sm scale-105' : 'text-slate-500 hover:text-slate-950'}`}
                            >
                                HI
                            </Link>
                        </div>

                        {auth.user ? (
                            <Link href={route('dashboard')} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors">{translations.nav_dashboard || 'Dashboard'}</Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-bold text-slate-900 hover:text-indigo-600 hover:bg-slate-100/80 px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95">{translations.nav_login || 'Log in'}</Link>
                                <Link href={route('register')} className="text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-full transition-all shadow-md hover:shadow-xl btn-shimmer hover:scale-105 active:scale-95">{translations.nav_register || 'Get Started'}</Link>
                            </>
                        )}
                    </div>

                    <div className="sm:hidden flex items-center">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-900 focus:outline-none">
                            {!menuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div 
                    className={`md:hidden bg-white border-b border-slate-100 absolute w-full z-40 shadow-xl transition-all duration-200 ease-out origin-top ${menuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-0 -translate-y-4 hidden'}`}
                >
                    <div className="px-6 py-8 space-y-6">
                        {/* Mobile Language Switcher */}
                        <div className="flex items-center gap-1 bg-slate-100/90 rounded-xl p-1 border border-slate-200/60 text-xs font-black w-fit">
                            <span className="px-2 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 0 1 8.716 6.747M12 3a9.003 9.003 0 0 0-8.716 6.747M12 9h.008v.008H12V9ZM3.75 12h16.5" />
                                </svg>
                            </span>
                            <Link 
                                href={route('language.switch', 'en')} 
                                className={`px-4.5 py-2 rounded-lg transition-all ${locale === 'en' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                English
                            </Link>
                            <Link 
                                href={route('language.switch', 'hi')} 
                                className={`px-4.5 py-2 rounded-lg transition-all ${locale === 'hi' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                हिन्दी (HI)
                            </Link>
                        </div>

                        {auth.user ? (
                            <Link href={route('dashboard')} className="block text-lg font-bold text-slate-900">{translations.nav_dashboard || 'Dashboard'}</Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="block text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">{translations.nav_login || 'Log in'}</Link>
                                <Link href={route('register')} className="block w-full bg-slate-900 text-white text-center py-4 rounded-2xl font-bold btn-shimmer">{translations.nav_register || 'Get Started'}</Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
                    <canvas id="network-canvas" className="absolute inset-0 pointer-events-none z-0 opacity-40"></canvas>
                    <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 lg:px-20 xl:px-32 pt-40 lg:pt-48 pb-20 lg:py-24 z-10 bg-white">
                        <div className="max-w-2xl">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.1] font-serif-custom reveal text-glow" style={{transitionDelay: '100ms'}}>
                                {translations.hero_title || 'SafetyNet:'} <br/>
                                <span className="text-indigo-600">
                                    <span>{typedText}</span>
                                    <span className="animate-pulse font-sans font-light text-indigo-600">|</span>
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg border-l-4 border-slate-900 pl-6 reveal" style={{transitionDelay: '200ms'}}>
                                {translations.hero_subtitle || 'A highly vetted, localized network for reporting incidents, viewing real-time safety heatmaps, and building a secure environment for your family.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 reveal" style={{transitionDelay: '300ms'}}>
                                <Link href={route('register')} className="btn-magnetic w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all text-center btn-shimmer shadow-lg hover:shadow-indigo-500/20">
                                    {translations.btn_join || 'Join the Network'}
                                </Link>
                                <a href="#features" className="btn-magnetic w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg border-2 border-slate-200 hover:border-slate-900 transition-all text-center">
                                    {translations.btn_how_it_works || 'How it works'}
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full lg:w-[45%] lg:absolute lg:top-0 lg:right-0 lg:bottom-0 h-[60vh] lg:h-screen reveal-right overflow-hidden" style={{transitionDelay: '400ms'}}>
                        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
                             alt="Professional Safety Monitoring" 
                             className="w-full h-full object-cover rounded-tl-[100px] lg:rounded-l-[100px] lg:rounded-tr-none shadow-2xl parallax-move animate-float-medium" 
                             data-parallax-speed="40" />
                        
                        {/* Dark Blue Cinematic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-indigo-950/20 to-transparent rounded-tl-[100px] lg:rounded-l-[100px] lg:rounded-tr-none pointer-events-none parallax-move" data-parallax-speed="40"></div>
 
                        {/* Floating Glassmorphism Alert Card 1 */}
                        <div className="absolute top-[16%] left-[8%] md:left-[15%] lg:left-[10%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-float-slow select-none parallax-move z-10 hero-glass-card cursor-pointer" data-parallax-speed="10">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center relative">
                                <span className="absolute w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                <span className="relative w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight text-white">{translations.card_incident_reported || 'Incident Reported'}</h4>
                                <p className="text-[10px] text-white/70 font-medium">{translations.card_incident_time || '2 mins ago • Greenwood Corridor'}</p>
                            </div>
                        </div>
 
                        {/* Floating Glassmorphism Alert Card 2 */}
                        <div className="absolute top-[48%] right-[8%] md:right-[15%] lg:right-[10%] bg-slate-950/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-float-medium select-none parallax-move z-10 hero-glass-card-dark cursor-pointer" data-parallax-speed="-14">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center relative">
                                <span className="absolute w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                                <span className="relative w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight text-white">{translations.card_patrol || 'Patrol Nearby'}</h4>
                                <p className="text-[10px] text-indigo-300 font-semibold">{translations.card_patrol_status || 'Active Dispatch • 1 min ago'}</p>
                            </div>
                        </div>
 
                        {/* Floating Glassmorphism Alert Card 3 */}
                        <div className="absolute bottom-[22%] left-[8%] md:left-[15%] lg:left-[12%] bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-float-slow select-none parallax-move z-10 hero-glass-card-dark cursor-pointer" data-parallax-speed="8" style={{animationDelay: '-2.5s'}}>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center relative">
                                <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight text-white">{translations.card_safe_zone || 'Safe Zone Active'}</h4>
                                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{translations.card_safe_zone_status || 'All Corridors Secure'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl parallax-img"></div>
                </div>
 
                <div id="features" className="py-32 bg-white border-t border-slate-100 relative overflow-hidden">
                    {/* Ambient Blurred Background Lighting */}
                    <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[130px] pointer-events-none animate-float-slow"></div>
                    <div className="absolute bottom-[20%] right-[-15%] w-[700px] h-[700px] bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 rounded-full blur-[150px] pointer-events-none animate-float-medium" style={{animationDelay: '-3s'}}></div>
 
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-24">
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 font-serif-custom mb-8 tracking-tight">{translations.section_title || 'The Future of Neighborhood Safety.'}</h2>
                            <p className="text-xl text-slate-600 leading-relaxed">{translations.section_subtitle || 'SafetyNet is not just a reporting tool—it is a complete security ecosystem designed to protect, inform, and guide your community.'}</p>
                        </div>

                        <div id="features-grid-container" className="relative">
                            {/* SVG Scroll path drawing connecting line */}
                            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-0 hidden md:block">
                                <svg className="w-full h-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="scroll-line-gradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                                            <stop offset="25%" stopColor="#4f46e5" stopOpacity="0.8" />
                                            <stop offset="75%" stopColor="#ec4899" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
                                        </linearGradient>
                                        <filter id="scroll-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="6" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    {/* Static dotted track path */}
                                    <path 
                                        ref={scrollPathTrackRef}
                                        d="M 50 0 C 30 125, 70 250, 50 375 C 30 500, 70 625, 50 750 C 35 875, 65 950, 50 1000" 
                                        fill="none" 
                                        stroke="#e2e8f0"
                                        strokeWidth="2" 
                                        strokeDasharray="8 8"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Drawing path */}
                                    <path 
                                        ref={scrollPathRef}
                                        d="M 50 0 C 30 125, 70 250, 50 375 C 30 500, 70 625, 50 750 C 35 875, 65 950, 50 1000" 
                                        fill="none" 
                                        stroke="url(#scroll-line-gradient)" 
                                        strokeWidth="3" 
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Glowing tip node */}
                                    <circle 
                                        ref={glowDotRef}
                                        r="6" 
                                        fill="#ec4899" 
                                        filter="url(#scroll-line-glow)"
                                        opacity="0"
                                        className="transition-opacity duration-200"
                                    />
                                </svg>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 relative z-10">
                            {/* Feature: AI Safety Guardian */}
                            <div className="reveal-left tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between group">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 relative z-10">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-500/30 text-white">AI</div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">SafetyNet AI Guardian</h4>
                                            <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest">Active & Vetted</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 text-xs relative z-10">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 max-w-[85%]">
                                            <p className="text-slate-300">"What is the current safety status of Greenwood Corridor?"</p>
                                        </div>
                                        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 text-slate-200">
                                            <span className="inline-block text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">⚡ AI Threat Analysis</span>
                                            <p className="leading-relaxed text-[11px]">Greenwood Corridor status is <span className="text-indigo-400 font-bold">Medium Risk</span>. 1 package theft detected nearby. <b className="text-indigo-300">Protocol:</b> Avoid late solo walks; security patrols dispatched.</p>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_ai_title || 'Interactive AI Safety Guardian'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_ai_desc || "Ask anything, get instant data-driven answers. Our Gemini-powered assistant aggregates your neighborhood's reports to analyze weekly risk curves, outline emergency protocols, and offer intelligent safety advice."}
                                </p>
                            </div>

                            {/* Feature: GIS Map Styles */}
                            <div className="reveal-right tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between group">
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 relative z-10">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">Vector Map Engine</h4>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Dynamic Styles</p>
                                        </div>
                                        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-indigo-200/30">Geofence Active</span>
                                    </div>
                                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 relative z-10">
                                        <div className="flex-1 text-center py-2 bg-white rounded-xl shadow-sm text-[10px] font-black text-slate-800 border border-slate-200/40">🗺️ Streets</div>
                                        <div className="flex-1 text-center py-2 text-[10px] font-black text-slate-400">🏔️ 3D Terrain</div>
                                        <div className="flex-1 text-center py-2 text-[10px] font-black text-slate-400">🛰️ Satellite</div>
                                    </div>
                                    <div className="p-4 bg-indigo-50/40 border border-indigo-100/40 rounded-2xl text-[10px] text-slate-600 leading-relaxed relative z-10">
                                        <span className="font-bold text-indigo-600">Pro Feature:</span> Toggle high-definition vector streets, 3D terrain elevation curves, and high-res satellite imagery instantly.
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_map_title || 'Dynamic GIS Map & 3D Topography'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_map_desc || 'Experience map layers like never before. Seamlessly toggle between High-Definition Vector Streets, 3D Terrain hillshading, and high-res Satellite Imagery with fully persistent geofence boundaries.'}
                                </p>
                            </div>

                            {/* Feature 1: Real-Time SOS */}
                            <div className="reveal-left tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] group bg-slate-950">
                                    <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800" alt="Real-Time SOS" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[3s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-red-950/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Immediate Action</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_sos_title || 'Real-Time SOS Intelligence'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_sos_desc || 'One-tap emergency alerts that broadcast instantly to the entire community. Powered by Pusher, our SOS system bypasses delays to warn everyone in the network within milliseconds of a threat.'}
                                </p>
                            </div>

                            {/* Feature 2: Interactive Heatmaps */}
                            <div className="reveal-right tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] group bg-slate-950">
                                    <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=800" alt="Security Heatmaps" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[3s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-indigo-950/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Visual Data</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_heatmap_title || 'Advanced Security Heatmaps'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_heatmap_desc || 'Visualize crime density using high-resolution Leaflet Heatmaps. We overlay your neighborhood data onto MapTiler professional imagery to show you exactly where safety attention is needed.'}
                                </p>
                            </div>

                            {/* Feature 3: GPS Navigation */}
                            <div className="reveal-left tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] group bg-slate-950">
                                    <img src="https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800" alt="GPS Navigation" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[3s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-emerald-950/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Responder Tools</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_gps_title || 'GPS-Guided Response'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_gps_desc || 'Every incident includes precise GPS coordinates. Our Navigate feature connects responders to Google Maps instantly, providing turn-by-turn directions to the scene for rapid intervention.'}
                                </p>
                            </div>

                            {/* Feature 4: Predictive Analytics */}
                            <div className="reveal-right tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] group bg-slate-950">
                                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="Safety Analytics" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[3s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <span className="px-3 py-1 bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Intelligence</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_analytics_title || 'Predictive Trend Analytics'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_analytics_desc || 'Our dashboard analyzes historical data to predict Peak Danger Hours and weekly safety trends. We turn raw reports into actionable insights through sophisticated Chart.js visualizations.'}
                                </p>
                            </div>

                            {/* Feature 5: Professional Reporting */}
                            <div className="reveal-left tilt-card">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 aspect-[4/3] group bg-slate-950">
                                    <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800" alt="PDF Reports" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[3s]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-800/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 z-10">
                                        <span className="px-3 py-1 bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Legal Proof</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 font-serif-custom mb-4">{translations.feat_pdf_title || 'Official PDF Case Reports'}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {translations.feat_pdf_desc || 'Generate professional, court-ready PDF documents for any incident. Each report includes high-res imagery, exact timestamps, and location data in a standardized official format.'}
                                </p>
                            </div>

                            {/* Feature 6: Verified Community */}
                            <div className="reveal-right">
                                <div className="bg-slate-900 rounded-3xl p-12 aspect-[4/3] flex flex-col justify-center border border-slate-800 shadow-2xl">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-black text-white font-serif-custom mb-6">{translations.feat_vetted_title || 'Vetted User Verification'}</h3>
                                    <p className="text-slate-400 leading-relaxed mb-8">
                                        {translations.feat_vetted_desc || 'Safety is built on trust. Our admin-approval system ensures that only verified neighborhood residents can report incidents, keeping the network free from spam and false alarms.'}
                                    </p>
                                    <Link href={route('register')} className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                                        {translations.feat_vetted_btn || 'Join the safe network'}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white text-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter uppercase">SafetyNet</span>
                                </div>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {translations.footer_tagline || "The world's first open-source neighborhood intelligence platform. Empowering citizens through real-time data and community vigilance."}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{translations.footer_status || 'All Systems Operational'}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8">{translations.footer_sec_ecosystem || 'Ecosystem'}</h4>
                                <ul className="space-y-4">
                                    <li><Link href={route('dashboard')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Global Dashboard</Link></li>
                                    <li><Link href={route('dashboard')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Live Heatmaps</Link></li>
                                    <li><Link href={route('dashboard')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Emergency SOS</Link></li>
                                    <li><Link href={route('dashboard')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Incident Reporting</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8">{translations.footer_sec_resources || 'Resources'}</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Safety Guidelines</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Community Handbook</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Official API</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Privacy Policy</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-8">{translations.footer_sec_built_with || 'Built With'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 text-center">Laravel 11</div>
                                    <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 text-center">Pusher JS</div>
                                    <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 text-center">MapTiler</div>
                                    <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 text-center">Tailwind</div>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                {translations.footer_copyright ? translations.footer_copyright.replace(':year', new Date().getFullYear()) : `© ${new Date().getFullYear()} SafetyNet. A community safety initiative.`}
                            </p>
                            <div className="flex gap-8">
                                <a href="#" className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Security Whitepaper</a>
                                <a href="#" className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
