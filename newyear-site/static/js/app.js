// Load data.json and render gallery
async function init() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();

    document.getElementById("page-title").innerText = data.title || "La mulți ani!";
    document.getElementById("page-subtitle").innerText = data.subtitle || "";

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    (data.photos || []).forEach(photo => {
      const col = document.createElement("div");
      col.className = "col-10 col-sm-6 col-md-4 col-lg-3";

      const card = document.createElement("div");
      card.className = "card card-photo shadow-lg";
      card.dataset.id = photo.id;

      const img = document.createElement("img");
      img.src = "/static/" + photo.file;
      img.className = "card-img-top";
      img.alt = photo.title || "";

      const body = document.createElement("div");
      body.className = "card-body text-light";
      body.innerHTML = `<h5 class="card-title">${photo.title || ""}</h5><p class="card-text">${photo.short || ""}</p>`;

      card.appendChild(img);
      card.appendChild(body);
      card.addEventListener("click", () => openModal(photo));

      col.appendChild(card);
      gallery.appendChild(col);
    });

    setupMusicButtons();
    launchConfetti();
  } catch (e) {
    console.error(e);
    alert("Eroare la încărcarea datelor. Verifică data.json.");
  }
}

function openModal(photo) {
  // setează titlu, imagine și text
  document.getElementById("modalTitle").innerText = photo.title || "";
  document.getElementById("modalImage").src = "/static/" + photo.file;
  document.getElementById("modalShort").innerText = photo.short || "";
  document.getElementById("modalLong").innerText = photo.long || "";

  // butoane extra
  const btns = document.getElementById("modalButtons");
  btns.innerHTML = "";

  // butoane din data.json (dacă există)
  (photo.extra_buttons || []).forEach(b => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-light me-2 mb-2";
    btn.innerText = b.label || "Află mai mult";
    if (b.type === "message") {
      btn.addEventListener("click", () => alert(b.payload || ""));
    } else if (b.type === "music") {
      btn.addEventListener("click", () => playMusic(b.payload));
    }
    btns.appendChild(btn);
  });

  // 💌 buton "Mesaj secret" pentru fiecare poză cu mesaj diferit
  const secretBtn = document.createElement("button");
  secretBtn.className = "btn btn-pulse mt-3";
  secretBtn.innerText = "Mesaj secret 💌";
  secretBtn.addEventListener("click", () => showSecretMessage(photo.id));
  btns.appendChild(secretBtn);

  // reține id-ul pozei curente (pentru slideshow)
  window.currentPhotoId = photo.id;

  // afișează modalul
  new bootstrap.Modal(document.getElementById("photoModal")).show();
}

function setupMusicButtons() {
  const bg = document.getElementById("bg-music");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");

  // ✅ Dynamic Island
  const island = document.getElementById("navIsland");
  const islandText = document.getElementById("navIslandText");

  if (!bg || !btnPlay || !btnPause) return;

  btnPlay.addEventListener("click", () => {
    bg.play().then(() => {
      // schimbă Dynamic Island când pornește muzica
      if (island && islandText) {
        island.classList.add("is-playing");
        islandText.innerHTML = `<span class="nav-island-dot"></span> Muzică pornită 🎵`;
      }
    }).catch(() => alert("Browserul a blocat autoplay. Apasă din nou pentru a porni."));
  });

  btnPause.addEventListener("click", () => {
    bg.pause();

    // revine la mesajul normal
    if (island && islandText) {
      island.classList.remove("is-playing");
      islandText.innerText = "🎆 An Nou Fericit, Alexa 🎆";
    }
  });
}


// Confetti animation
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);
  const confetti = [];

  for (let i = 0; i < 25; i++) {
    confetti.push({
      x: Math.random() * W,
      y: Math.random() * H - H,
      r: Math.random() * 6 + 2,
      d: Math.random() * 100,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.fillStyle = c.color;
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
      ctx.fill();
    });
    update();
    requestAnimationFrame(draw);
  }

  function update() {
    confetti.forEach(c => {
      c.y += Math.cos(c.d) + 1 + c.r / 3;
      c.x += Math.sin(c.d);
      if (c.y > H) {
        c.y = -10;
        c.x = Math.random() * W;
      }
    });
  }

  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  draw();
}

window.addEventListener("DOMContentLoaded", init);

function createHeart() {
  const heart = document.createElement("div");
  const colors = ["❤️", "🩷", "💖", "💘", "💜", "💙", "💚", "🧡"];
  heart.innerHTML = colors[Math.floor(Math.random() * colors.length)];
  heart.classList.add("falling-heart");

  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 4 + Math.random() * 3 + "s";
  heart.style.fontSize = 18 + Math.random() * 25 + "px";

  document.body.appendChild(heart);

  // 🔹 Aici adaugă exact linia asta:
  heart.addEventListener("animationend", () => heart.remove());
}

let slideshowInterval = null;

// 🔹 Pornește slideshow-ul când se deschide modalul
document.addEventListener("shown.bs.modal", (event) => {
  if (event.target.id !== "photoModal") return;

  // Înainte de a porni altul, oprim orice slideshow existent
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }

  const modalImage = document.getElementById("modalImage");
  if (!modalImage || !window.currentPhotoId) return;

  // 🔸 Definim pozele pentru fiecare tablou
  const slides = {
    p1: ["/static/images/1a.jpg", "/static/images/1b.jpg"],
    p2: ["/static/images/2a.jpg", "/static/images/2b.jpg"],
    p3: ["/static/images/3a.jpg", "/static/images/3b.jpg"]
  };

  const modalImages = slides[window.currentPhotoId];
  if (!modalImages) return;

  let index = 0;
  modalImage.src = modalImages[index];

  // 🌸 schimbă imaginea la fiecare 3,5 secunde cu efect fade
  slideshowInterval = setInterval(() => {
    index = (index + 1) % modalImages.length;
    modalImage.style.opacity = 0;
    setTimeout(() => {
      modalImage.src = modalImages[index];
      modalImage.style.opacity = 1;
    }, 400);
  }, 3500);
});

// 🔹 Oprește slideshow-ul când se închide modalul
document.addEventListener("hidden.bs.modal", (event) => {
  if (event.target.id === "photoModal" && slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
});

// 💖 Funcția pentru "Mesaj secret" personalizat
function showSecretMessage(photoId) {
  const message = document.createElement("div");
  message.classList.add("secret-message");

  // 🌸 Alege mesajul și emojiurile în funcție de tablou
  let text = "";
  let intervalTime = 250;
  let colors = ["❤️", "💖", "💘"];

  if (photoId === "p1") {
    text = "Te iubesc dincolo de stele 🌸💫";
    colors = ["💖", "💘", "💞", "💓"];
    intervalTime = 200;
  } else if (photoId === "p2") {
    text = "Fiecare clipă cu tine e un miracol ✨💐";
    colors = ["🌸", "🌺", "🌷", "💗"];
    intervalTime = 300;
  } else if (photoId === "p3") {
    text = "Tu ești motivul pentru care zâmbesc 💕🌙";
    colors = ["💜", "💙", "💗", "💞"];
    intervalTime = 180;
  } else {
    text = "Cu tine, fiecare zi e specială 💫";
  }

  // adaugă textul
  message.innerHTML = `<p>${text}</p>`;
  document.body.appendChild(message);

  // efect de apariție
  setTimeout(() => message.classList.add("show"), 100);

  // ❤️ Creează inimioare/flori în funcție de culori
  const heartsInterval = setInterval(() => {
    const heart = document.createElement("div");
    heart.innerHTML = colors[Math.floor(Math.random() * colors.length)];
    heart.classList.add("falling-heart");
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = 4 + Math.random() * 3 + "s";
    heart.style.fontSize = 18 + Math.random() * 25 + "px";
    document.body.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }, intervalTime);

  // după 6 secunde, oprim inimile + mesajul
  setTimeout(() => {
    clearInterval(heartsInterval);
    message.classList.remove("show");
    setTimeout(() => message.remove(), 1000);
  }, 6000);
}

// 💫 Particule care urmăresc cursorul
document.addEventListener("mousemove", (e) => {
  const sparkle = document.createElement("div");
  sparkle.classList.add("cursor-particle");

  // poți schimba emoji-urile
  const emojis = ["💗", "💜", "🌸",];
  sparkle.innerText = emojis[Math.floor(Math.random() * emojis.length)];

  // poziționează exact la cursor
  sparkle.style.left = e.pageX + "px";
  sparkle.style.top = e.pageY + "px";

  document.body.appendChild(sparkle);

  // dispare după 1.5s
  setTimeout(() => {
    sparkle.remove();
  }, 120);
});

// 🌸 Animația ecranului de început
window.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("intro-screen");
  const mainContent = document.querySelector("main");
  const navbar = document.querySelector("nav");

  if (!introScreen) {
    console.warn("⚠️ Ecranul de început nu a fost găsit în pagină!");
    return;
  }

  // ascunde conținutul principal la început
  mainContent.style.display = "none";
  navbar.style.display = "none";

  // când utilizatorul apasă sau trage în sus
  introScreen.addEventListener("click", hideIntro);
  introScreen.addEventListener("wheel", hideIntro);
  introScreen.addEventListener("touchmove", hideIntro);

  function hideIntro() {
    introScreen.classList.add("fade-out");
    setTimeout(() => {
      introScreen.style.display = "none";
      mainContent.style.display = "block";
      navbar.style.display = "flex";
    }, 1000);
  }
});

function setupMusicButtons() {
  const bg = document.getElementById("bg-music");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");

  if (!bg || !btnPlay || !btnPause) return;

  btnPlay.addEventListener("click", () => {
    bg.play().catch(() => {
      alert("Apasă din nou pentru a porni muzica 🎵");
    });
  });

  btnPause.addEventListener("click", () => bg.pause());
}














