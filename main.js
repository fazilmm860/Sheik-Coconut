/**
 * main.js - SHEIK Coconut Premium Landing Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       Header Scroll Logic
       ========================================================================== */
    const header = document.querySelector('.site-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Optional dark mode header when reaching dark sections
        const productsSection = document.getElementById('products');
        if (productsSection) {
            const rect = productsSection.getBoundingClientRect();
            // If the top of the products section is at or above the bottom of the header
            if (rect.top <= header.offsetHeight && rect.bottom >= 0) {
                header.classList.add('scrolled-dark');
            } else {
                header.classList.remove('scrolled-dark');
            }
        }
    });

    /* ==========================================================================
       Scroll Reveal using Intersection Observer
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* ==========================================================================
       Hero Image Sequence Canvas Logic
       ========================================================================== */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const context = canvas.getContext('2d');
        const heroSection = document.getElementById('hero');
        // We have 240 frames, numbered 001 to 240
        const frameCount = 240; 
        
        // Function to generate image path based on index
        // padded to 3 digits (e.g. 001, 012, 145)
        const currentFrame = index => (
            `assests/heroSection/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
        );

        // Array to cache loaded images
        const images = [];
        let imagesLoaded = 0;
        
        // Set Canvas size (Full HD resolution base, but maintain aspect ratio)
        canvas.width = 1920;
        canvas.height = 1080;

        // Draw the image nicely covering the canvas (object-fit: cover equivalent for canvas)
        function drawImageCover(img) {
            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.width;
            const ih = img.height;
            
            const hRatio = cw / iw;
            const vRatio = ch / ih;
            const ratio = Math.max(hRatio, vRatio);
            
            const centerShift_x = (cw - iw * ratio) / 2;
            const centerShift_y = (ch - ih * ratio) / 2;
            
            context.clearRect(0,0,cw,ch);
            context.drawImage(img, 0,0, iw, ih, centerShift_x, centerShift_y, iw * ratio, ih * ratio);
        }

        // Preload images
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
            
            img.onload = () => {
                imagesLoaded++;
                // Draw the first frame once it's loaded
                if (i === 1) {
                    drawImageCover(img);
                }
            };
        }

        // Connect text elements to show up at specific scroll percentages within hero
        const seqText1 = document.querySelector('.hero-text-block.seq-1');
        const seqText2 = document.querySelector('.hero-text-block.seq-2');
        const seqText3 = document.querySelector('.hero-text-block.seq-3');

        // Main scroll listener for hero sequence
        window.addEventListener('scroll', () => {  
            // Calculate scroll progress within the hero section
            const scrollTop = window.scrollY;
            // The scrollable range is the total height of the hero minus viewport height
            const maxScrollTop = heroSection.scrollHeight - window.innerHeight;
            
            if (scrollTop > maxScrollTop + window.innerHeight) return; // Passed the hero completely
            
            const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollFraction * frameCount)
            );

            // Uses RequestAnimationFrame for smoother canvas painting
            requestAnimationFrame(() => {
                if (images[frameIndex] && images[frameIndex].complete) {
                    drawImageCover(images[frameIndex]);
                }
            });

            // Sync text animations based on scroll fractions
            // Sequnce 1: Visible from 0 to 25%
            if (scrollFraction < 0.25) {
                seqText1.classList.add('visible');
            } else {
                seqText1.classList.remove('visible');
            }

            // Sequence 2: Visible from 30% to 60%
            if (scrollFraction > 0.3 && scrollFraction < 0.6) {
                seqText2.classList.add('visible');
            } else {
                seqText2.classList.remove('visible');
            }

            // Sequence 3: Visible from 65% to 95%
            if (scrollFraction > 0.65 && scrollFraction < 0.95) {
                seqText3.classList.add('visible');
            } else {
                seqText3.classList.remove('visible');
            }
        });
    }

    /* ==========================================================================
       Story Page Background Video
       ========================================================================== */
    const storyVideo = document.getElementById('story-video');
    if (storyVideo) {
        // Slow down playback for cinematic, calm effect
        storyVideo.playbackRate = 0.6;
    }

    /* ==========================================================================
       Simple Parallax for Background Elements
       ========================================================================== */
    const parallaxImages = document.querySelectorAll('.parallax-img');
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            parallaxImages.forEach(img => {
                const rect = img.parentElement.getBoundingClientRect();
                // Check if element is somewhat visible
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const scrollPos = window.innerHeight - rect.top;
                    // Move the image slightly downwards as you scroll down
                    const yPos = (scrollPos * 0.1) - 50; 
                    img.style.transform = `translateY(${yPos}px)`;
                }
            });
        });
    });

    /* ==========================================================================
       Product Page Logic
       ========================================================================== */
    const productVideo = document.getElementById('product-video');
    if (productVideo) {
        // Slow down playback for cinematic hero effect
        productVideo.playbackRate = 0.7;
    }

    /* Carousel Implementation */
    const carousels = document.querySelectorAll('.product-carousel');
    
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        if(!track) return;
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-btn.next');
        const prevButton = carousel.querySelector('.carousel-btn.prev');
        const navDotsContainer = carousel.querySelector('.carousel-nav');
        
        let currentIndex = 0;

        // Generate dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            navDotsContainer.appendChild(dot);
            
            dot.addEventListener('click', () => {
                moveToSlide(index);
            });
        });

        const dots = Array.from(navDotsContainer.children);

        function updateDots() {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        }

        function moveToSlide(index) {
            if (index < 0 || index >= slides.length) return;
            track.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateDots();
        }

        if(nextButton) {
            nextButton.addEventListener('click', () => {
                let nextIndex = currentIndex + 1;
                if (nextIndex >= slides.length) nextIndex = 0; // wrap around
                moveToSlide(nextIndex);
            });
        }

        if(prevButton) {
            prevButton.addEventListener('click', () => {
                let prevIndex = currentIndex - 1;
                if (prevIndex < 0) prevIndex = slides.length - 1; // wrap around
                moveToSlide(prevIndex);
            });
        }
    });
    /* ==========================================================================
       Home Page 3D Coverflow Carousel
       ========================================================================== */
    const cfTrack = document.getElementById('cf-track');
    if (cfTrack) {
        const cfCards = Array.from(cfTrack.querySelectorAll('.coverflow-card'));
        const cfPrev = document.getElementById('cf-prev');
        const cfNext = document.getElementById('cf-next');
        const cfPagination = document.getElementById('cf-pagination');
        
        let cfCurrentIndex = Math.floor(cfCards.length / 2); // Start at middle card
        
        // Setup pagination dots
        cfCards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('cf-dot');
            if(i === cfCurrentIndex) dot.classList.add('active');
            cfPagination.appendChild(dot);
            dot.addEventListener('click', () => updateCoverflow(i));
        });
        const cfDots = Array.from(cfPagination.querySelectorAll('.cf-dot'));

        function updateCoverflow(index) {
            cfCurrentIndex = index;
            
            // Update dots
            cfDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            // Loop through all cards and calculate 3D transforms based on distance from center
            cfCards.forEach((card, i) => {
                card.classList.remove('active');
                
                let distance = i - index;
                
                if (distance === 0) {
                    card.style.transform = `translateX(0) translateZ(0) rotateY(0)`;
                    card.style.zIndex = 10;
                    card.style.opacity = 1;
                    card.style.filter = `blur(0px)`;
                    card.classList.add('active');
                } else {
                    let sign = Math.sign(distance);
                    let absDist = Math.abs(distance);
                    
                    // The further away, the more it goes backwards and to the side
                    let translateX = sign * (135 * absDist); // horizontal spread
                    let translateZ = -220 * absDist; // depth scaling
                    let rotateY = sign * -25; // face inwards
                    let blurFactor = absDist * 1.5;
                    let opacity = 1 - (absDist * 0.35);
                    
                    card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
                    card.style.zIndex = 10 - absDist;
                    card.style.opacity = opacity > 0 ? opacity : 0;
                    card.style.filter = `blur(${blurFactor}px)`;
                }
                
                // Allow clicking adjacent cards to navigate to them directly
                card.onclick = (e) => {
                    if (distance !== 0) {
                        e.preventDefault(); // Prevent accidental 'Explore' click
                        updateCoverflow(i);
                    }
                };
            });
        }
        
        // Initialize
        updateCoverflow(cfCurrentIndex);

        if(cfNext) {
            cfNext.addEventListener('click', () => {
                let nextIdx = cfCurrentIndex + 1;
                if(nextIdx >= cfCards.length) nextIdx = 0;
                updateCoverflow(nextIdx);
            });
        }
        
        if(cfPrev) {
            cfPrev.addEventListener('click', () => {
                let prevIdx = cfCurrentIndex - 1;
                if(prevIdx < 0) prevIdx = cfCards.length -1;
                updateCoverflow(prevIdx);
            });
        }

        // Swipe & Mouse Drag Support
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;
        
        cfTrack.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        cfTrack.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
        
        cfTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            touchStartX = e.pageX;
        });
        
        document.addEventListener('mouseup', (e) => {
            if(!isDragging) return;
            isDragging = false;
            touchEndX = e.pageX;
            handleSwipe();
        });
        
        function handleSwipe() {
            let difference = touchStartX - touchEndX;
            if (Math.abs(difference) > 40) { // threshold
                if (difference > 0) {
                    // Swiped left -> next
                    let nextIdx = cfCurrentIndex + 1;
                    if(nextIdx >= cfCards.length) nextIdx = 0;
                    updateCoverflow(nextIdx);
                } else {
                    // Swiped right -> prev
                    let prevIdx = cfCurrentIndex - 1;
                    if(prevIdx < 0) prevIdx = cfCards.length -1;
                    updateCoverflow(prevIdx);
                }
            }
        }
    }
});
