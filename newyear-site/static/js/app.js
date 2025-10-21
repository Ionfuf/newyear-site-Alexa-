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
  document.getElementById("modalTitle").innerText = photo.title || "";
  document.getElementById("modalImage").src = "/static/" + photo.file;
  document.getElementById("modalShort").innerText = photo.short || "";
  document.getElementById("modalLong").innerText = photo.long || "";
  const btns = document.getElementById("modalButtons");
  btns.innerHTML = "";

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

  new bootstrap.Modal(document.getElementById("photoModal")).show();
}

function playMusic(filename) {
  const audio = new Audio("/static/music/" + filename);
  audio.play();
}

function setupMusicButtons() {
  const bg = document.getElementById("bg-music");
  const btnPlay = document.getElementById("btnPlay");
  const btnPause = document.getElementById("btnPause");
  if (!bg || !btnPlay || !btnPause) return;

  btnPlay.addEventListener("click", () => {
    bg.play().catch(() => alert("Browserul a blocat autoplay. Apasă din nou pentru a porni."));
  });
  btnPause.addEventListener("click", () => bg.pause());
}

// Confetti animation
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  let W = (canvas.width = window.innerWidth);
  let H = (canvas.height = window.innerHeight);
  const confetti = [];

  for (let i = 0; i < 180; i++) {
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
