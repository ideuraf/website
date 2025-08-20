document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const image = $("toggleImage"),
          wrapper = $("imageWrapper"),
          hiddenText = $("hiddenText"),
          aboutBtn = $("aboutBtn"),
          contactBtn = $("contactBtn"),
          aboutPopup = $("aboutPopup"),
          contactPopup = $("contactPopup"),
          themeToggle = $("themeToggle"),
          themeIcon = $("themeIcon"),
          wakeAudio = $("wakeAudio"),
          hoverAudio = $("hoverAudio"),
          clickAudio = $("clickAudio");
  
    let isIdle = false;
    const play = a => { a.currentTime = 0; a.play().catch(() => {}); };
    const lastPositions = { aboutPopup: null, contactPopup: null };

    function initializeDrag(popup) {
      let mousedownListener = null;
      
      function handleMouseDown(e) {
        if (e.target.closest('.close-btn') || e.target.closest('.copy-email')) return;
        
        const rect = popup.getBoundingClientRect();
        const dragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.top}px`;
        popup.style.transform = 'none';
        popup.classList.add('dragging');
        
        function handleMouseMove(e) {
          const maxX = window.innerWidth - popup.offsetWidth;
          const maxY = window.innerHeight - popup.offsetHeight;
          const x = Math.max(0, Math.min(e.clientX - dragOffset.x, maxX));
          const y = Math.max(0, Math.min(e.clientY - dragOffset.y, maxY));
          
          popup.style.left = `${x}px`;
          popup.style.top = `${y}px`;
          lastPositions[popup.id] = { left: x, top: y };
        }
        
        function handleMouseUp() {
          popup.classList.remove('dragging');
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
      }

      popup.enableDragging = () => {
        if (!mousedownListener) {
          mousedownListener = handleMouseDown;
          popup.addEventListener('mousedown', mousedownListener);
        }
      };

      popup.disableDragging = () => {
        if (mousedownListener) {
          popup.removeEventListener('mousedown', mousedownListener);
          mousedownListener = null;
        }
      };
    }
  
    initializeDrag(aboutPopup);
    initializeDrag(contactPopup);
  
    // theme handling >-<
    themeIcon.textContent = (document.documentElement.getAttribute("data-theme") || "light") === "dark" ? "light_mode" : "dark_mode";
    
    themeToggle.onmouseenter = () => play(hoverAudio);
    themeToggle.onclick = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      play(clickAudio);
  
      themeIcon.style.transition = "transform 0.4s ease";
      themeIcon.style.transform = "scale(0) rotate(180deg)";
      setTimeout(() => {
        themeIcon.textContent = newTheme === "dark" ? "light_mode" : "dark_mode";
        themeIcon.style.transform = "scale(1) rotate(0deg)";
      }, 200);
    };
  
    // pompom ^-^
    image.oncontextmenu = e => e.preventDefault();
    image.onmouseenter = () => !isIdle && play(hoverAudio);
    image.onclick = () => {
      if (isIdle) return;
      play(clickAudio);
      
      image.onclick = null;
      
      const rect = image.getBoundingClientRect();
      createAngyParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
      
      image.src = "assets/pompom/wake.png";
      image.classList.remove("no-hover");
      
      setTimeout(() => {
        image.src = "assets/pompom/idle.png";
        play(wakeAudio);
        wrapper.classList.add("active");
        image.classList.add("shrunk");
        isIdle = true;
        
        setTimeout(() => {
          wrapper.classList.add("show-buttons");
          aboutBtn.disabled = contactBtn.disabled = false;
        }, 400);
      }, 1200);
    };
  
    // age and text ._.
    const age = new Date().getFullYear() - 2007 - (new Date().getMonth() < 7 || (new Date().getMonth() === 7 && new Date().getDate() < 29) ? 1 : 0);
    hiddenText.innerHTML = `<p class="name">syed jaffery, ${age}</p><strong class="major">computer engineering @ university of houston</strong>`;
    $("ageSpan").textContent = age;
  
    // btns
    [aboutBtn, contactBtn].forEach(btn => btn.onmouseenter = () => isIdle && play(hoverAudio));
    
    function showPopup(popup) {
      if (!isIdle) return;
      play(clickAudio);
      popup.classList.add("show");
      
      if (lastPositions[popup.id]) {
        Object.assign(popup.style, {
          left: `${lastPositions[popup.id].left}px`,
          top: `${lastPositions[popup.id].top}px`,
          transform: 'none'
        });
        popup.offsetHeight;
        popup.style.transition = 'all 0.5s ease';
        popup.style.left = '';
        popup.style.top = '';
        popup.style.transform = '';
      }
      
      popup.disableDragging();
      setTimeout(() => {
        popup.style.transition = '';
        popup.enableDragging();
      }, 500);
    }
    
    aboutBtn.onclick = () => showPopup(aboutPopup);
    contactBtn.onclick = () => showPopup(contactPopup);
  
    // x_x
    [$("closeAboutPopup"), $("closePopup")].forEach(btn => {
      btn.onmouseenter = () => play(hoverAudio);
      btn.onclick = () => {
        play(clickAudio);
        const popup = btn.closest('.popup');
        popup.disableDragging();
        popup.classList.remove("show");
        lastPositions[popup.id] = null;
      };
    });
  
    // email
    const email = $("email");
    email.onmouseenter = () => play(hoverAudio);
    email.onclick = () => {
      play(clickAudio);
      navigator.clipboard.writeText(email.textContent.replace(/✉️|\s/g, ""))
        .then(() => {
          contactPopup.disableDragging();
          contactPopup.classList.remove("show");
        });
    };
  
    // bg canvas :D
    const canvas = $("backgroundCanvas");
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    }

    function createAngyParticle(x, y, size = 15) {
      const particle = document.createElement('div');
      particle.className = 'exclamation-particle';
      particle.style.setProperty('--size', `${size}px`);
      
      const img = document.createElement('img');
      img.src = 'assets/pompom/angy.png';
      img.alt = '';
      particle.appendChild(img);
      
      const rect = image.getBoundingClientRect();
      const offsetX = rect.width * 0.225;
      const offsetY = -rect.height * 0.255;
      
      particle.style.left = `${x + offsetX}px`;
      particle.style.top = `${y + offsetY}px`;
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }

    // init theme
    document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "light");
    
    // init bg
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
});
