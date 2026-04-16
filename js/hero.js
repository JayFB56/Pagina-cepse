(function(){
  // Expose init function
  function initHero() {
    const carousel = document.getElementById('hero-carousel');
    if (!carousel) return false;

    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    if (!slides.length) return false;

    const indicators = document.getElementById('hero-indicators');
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    let current = 0;
    const total = slides.length;
    const intervalTime = 5000; // 5s autoplay
    let autoplayId = null;

    function showSlide(index){
      slides.forEach((s,i)=>{
        s.style.transition = 'opacity 800ms ease';
        s.style.opacity = (i===index)? '1':'0';
        s.setAttribute('aria-hidden', i===index ? 'false' : 'true');
      });
      if (indicators) {
        const dots = indicators.querySelectorAll('button');
        dots.forEach((d,i)=> d.classList.toggle('opacity-60', i!==index));
      }
      current = index;
    }

    function next(){ showSlide((current+1)%total); }
    function prev(){ showSlide((current-1+total)%total); }

    // build indicators if needed
    if (indicators && indicators.children.length === 0) {
      for(let i=0;i<total;i++){
        const btn = document.createElement('button');
        btn.className = 'w-3 h-3 rounded-full bg-white/80';
        btn.setAttribute('aria-label', 'Slide '+(i+1));
        btn.addEventListener('click', ()=>{ showSlide(i); resetAutoplay(); });
        indicators.appendChild(btn);
      }
    }

    if(nextBtn) nextBtn.addEventListener('click', ()=>{ next(); resetAutoplay(); });
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); resetAutoplay(); });

    // swipe support
    let startX = 0; let dist = 0;
    carousel.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; });
    carousel.addEventListener('touchmove', (e)=>{ dist = e.touches[0].clientX - startX; });
    carousel.addEventListener('touchend', ()=>{ if(dist > 40) { prev(); } else if(dist < -40) { next(); } dist = 0; resetAutoplay(); });

    function startAutoplay(){ autoplayId = setInterval(next, intervalTime); }
    function stopAutoplay(){ if(autoplayId){ clearInterval(autoplayId); autoplayId = null; } }
    function resetAutoplay(){ stopAutoplay(); startAutoplay(); }

    // init
    showSlide(0);
    startAutoplay();

    return true;
  }

  // Try init immediately
  if (!initHero()) {
    // Poll until the element is available (component injected)
    const maxAttempts = 60; // ~6s
    let attempts = 0;
    const poll = setInterval(()=>{
      attempts++;
      if (initHero() || attempts>maxAttempts) clearInterval(poll);
    }, 100);
  }

  // expose globally so index can call it
  window.initHero = initHero;
})();
