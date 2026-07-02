// ==========================================
// 1. STATE & GLOBAL CONFIGURATIONS
// ==========================================

let childName = "Buddy";
let starPoints = 1250;
let activeLevel = 0;
let solvedThisSession = [];
let isAudioMuted = false;
let webAudioCtx = null;

// 15 educational Levels data bank
const spellingLevelsData = [
  {
    id: 1,
    text: "NANGKA",
    hint: "N A N G _ A",
    missing: "K",
    options: ["O", "K", "B", "Z"],
    emoji: "🍈",
  },
  {
    id: 2,
    text: "NENEK",
    hint: "N E _ E K",
    missing: "N",
    options: ["D", "N", "Q", "C"],
    emoji: "👵",
  },
  {
    id: 3,
    text: "EKOR",
    hint: "E K _ R",
    missing: "O",
    options: ["O", "X", "Q", "P"],
    emoji: "🐄",
  },
  {
    id: 4,
    text: "ANGGUR",
    hint: "A N _ G U R",
    missing: "G",
    options: ["M", "G", "V", "L"],
    emoji: "🍇",
  },
  {
    id: 5,
    text: "PISANG",
    hint: "P _ S A N G",
    missing: "I",
    options: ["A", "E", "I", "U"],
    emoji: "🍌",
  },
  {
    id: 6,
    text: "BALON",
    hint: "B A L _ N",
    missing: "O",
    options: ["E", "O", "A", "I"],
    emoji: "🎈",
  },
  {
    id: 7,
    text: "ROBOT",
    hint: "R O _ O T",
    missing: "B",
    options: ["D", "P", "B", "M"],
    emoji: "🤖",
  },
  {
    id: 8,
    text: "MOBIL",
    hint: "M O B _ L",
    missing: "I",
    options: ["I", "U", "E", "O"],
    emoji: "🚗",
  },
  {
    id: 9,
    text: "AYAM",
    hint: "A _ A M",
    missing: "Y",
    options: ["X", "W", "Y", "V"],
    emoji: "🐓",
  },
  {
    id: 10,
    text: "BEBEK",
    hint: "B E B _ K",
    missing: "E",
    options: ["A", "E", "I", "O"],
    emoji: "🦆",
  },
  {
    id: 11,
    text: "BUAYA",
    hint: "B U _ A Y A",
    missing: "A",
    options: ["I", "U", "O", "A"],
    emoji: "🐊",
  },
  {
    id: 12,
    text: "LEMARI",
    hint: "L E M _ R I",
    missing: "A",
    options: ["E", "A", "O", "I"],
    emoji: "🚪",
  },
  {
    id: 13,
    text: "SEPATU",
    hint: "S E _ A T U",
    missing: "P",
    options: ["B", "D", "P", "T"],
    emoji: "👟",
  },
  {
    id: 14,
    text: "TOPI",
    hint: "T O _ I",
    missing: "P",
    options: ["M", "N", "B", "P"],
    emoji: "🧢",
  },
  {
    id: 15,
    text: "JERUK",
    hint: "J E R _ K",
    missing: "U",
    options: ["O", "U", "A", "E"],
    emoji: "🍊",
  },
];

// ==========================================
// 2. CLIENT SIDE AUDIO SYNTHESIZER
// ==========================================
function getWebAudioContext() {
  if (!webAudioCtx) {
    webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (webAudioCtx.state === "suspended") {
    webAudioCtx.resume();
  }
  return webAudioCtx;
}

function playChime(chimeType) {
  if (isAudioMuted) return;
  try {
    const ctx = getWebAudioContext();
    const now = ctx.currentTime;

    if (chimeType === "tap") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (chimeType === "correct") {
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } else if (chimeType === "incorrect") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(261.63, now);
      osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (chimeType === "victory") {
      const victoryNotes = [
        523.25, 523.25, 523.25, 659.25, 783.99, 1046.5, 1318.51,
      ];
      const timings = [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.55];
      const durations = [0.06, 0.06, 0.06, 0.06, 0.1, 0.12, 0.45];
      victoryNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + timings[idx]);
        gain.gain.setValueAtTime(0.15, now + timings[idx]);
        gain.gain.exponentialRampToValueAtTime(
          0.005,
          now + timings[idx] + durations[idx],
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + timings[idx]);
        osc.stop(now + timings[idx] + durations[idx] + 0.05);
      });
    }
  } catch (err) {
    console.warn("Audio Context error / not supported:", err);
  }
}

function toggleAudioMute() {
  isAudioMuted = !isAudioMuted;
  localStorage.setItem("paud_audio_mute", JSON.stringify(isAudioMuted));
  playChime("tap");
  refreshAudioIconUI();
}

function refreshAudioIconUI() {
  const btn = document.getElementById("audio-toggle-btn");
  const icon = document.getElementById("audio-toggle-icon");
  if (!btn || !icon) return;

  if (isAudioMuted) {
    btn.className =
      "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-rose-400 to-rose-500 border-b-4 border-rose-700 text-white flex items-center justify-center text-xl shadow-md cursor-pointer hover:scale-110 active:scale-90 transition";
    icon.className = "fa-solid fa-volume-xmark";
  } else {
    btn.className =
      "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-500 border-b-4 border-sky-700 text-white flex items-center justify-center text-xl shadow-md cursor-pointer hover:scale-110 active:scale-90 transition";
    icon.className = "fa-solid fa-volume-high";
  }
}

// ==========================================
// 3. CONFETTI CELEBRATION SYSTEM
// ==========================================
const canvas = document.getElementById("confetti-canvas");
const ctxCanvas = canvas.getContext("2d");
let particles = [];
let isCelebrating = false;

function resizeConfettiCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

function makeConfettiBurst() {
  isCelebrating = true;
  particles = [];
  const colors = [
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6",
    "#ef4444",
  ];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -100 - 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 5 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
    });
  }
  runConfettiLoop();
}

function runConfettiLoop() {
  if (!isCelebrating) return;
  ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
  let active = false;

  particles.forEach((p) => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    ctxCanvas.save();
    ctxCanvas.translate(p.x, p.y);
    ctxCanvas.rotate((p.rotation * Math.PI) / 180);
    ctxCanvas.fillStyle = p.color;
    ctxCanvas.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctxCanvas.restore();

    if (p.y < canvas.height) active = true;
  });

  if (active) {
    requestAnimationFrame(runConfettiLoop);
  } else {
    isCelebrating = false;
    ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==========================================
// 4. CORE APP FUNCTIONS & LOGIC
// ==========================================
function initAppStorage() {
  const cachedMuteState = localStorage.getItem("paud_audio_mute");
  if (cachedMuteState !== null) {
    isAudioMuted = JSON.parse(cachedMuteState);
  }
  refreshAudioIconUI();

  // 1. GANTI localStorage menjadi sessionStorage khusus untuk NAMA
  const cachedName = sessionStorage.getItem("paud_user_name");
  const cachedStars = localStorage.getItem("paud_star_points"); // Skor bintang tetap permanen di HP

  if (cachedName && cachedName.trim() !== "" && cachedName !== "undefined") {
    childName = cachedName;
    document.getElementById("display-username").innerText = childName;
    document.getElementById("screen-splash").classList.add("hidden");
    document.getElementById("screen-dashboard").classList.remove("hidden");
  } else {
    // Jika tidak ada nama di sesi ini, paksa tampilkan halaman ketik nama
    document.getElementById("screen-splash").classList.remove("hidden");
    document.getElementById("screen-dashboard").classList.add("hidden");
  }

  if (cachedStars) {
    starPoints = parseInt(cachedStars);
    document.getElementById("display-stars").innerText = starPoints;
    document.getElementById("gameplay-score-count").innerText = starPoints;
  }
}

function handleLogin() {
  const inputVal = document.getElementById("username-input").value.trim();
  if (!inputVal) {
    showCustomAlert(
      "👦👧",
      "Tulis Namamu Sayang!",
      "Ayo ketik namamu dulu di kotak agar kita bisa bermain bersama ya!",
    );
    return;
  }

  childName = inputVal;

  // 2. GANTI JUGA DI SINI: Simpan nama di sessionStorage agar hilang saat refresh
  sessionStorage.setItem("paud_user_name", childName);

  document.getElementById("display-username").innerText = childName;

  saveToLeaderboard(childName, starPoints);

  playChime("victory");
  makeConfettiBurst();

  document.getElementById("screen-splash").classList.add("hidden");
  document.getElementById("screen-dashboard").classList.remove("hidden");
}

function showCustomAlert(emoji, title, body) {
  playChime("tap");
  document.getElementById("custom-alert-emoji").innerText = emoji;
  document.getElementById("custom-alert-title").innerText = title;
  document.getElementById("custom-alert-body").innerText = body;

  const modal = document.getElementById("custom-alert-modal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.children[0].classList.remove("scale-95");
    modal.children[0].classList.add("scale-100");
  }, 10);
}

function closeCustomAlert() {
  playChime("tap");
  const modal = document.getElementById("custom-alert-modal");
  modal.children[0].classList.add("scale-95");
  modal.children[0].classList.remove("scale-100");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 100);
}

function handleLogin() {
  const inputVal = document.getElementById("username-input").value.trim();
  if (!inputVal) {
    showCustomAlert(
      "👦👧",
      "Tulis Namamu Sayang!",
      "Ayo ketik namamu dulu di kotak agar kita bisa bermain bersama ya!",
    );
    return;
  }

  childName = inputVal;
  localStorage.setItem("paud_user_name", childName);
  document.getElementById("display-username").innerText = childName;

  // Daftarkan nama baru ke leaderboard dengan skor awal jika belum ada
  saveToLeaderboard(childName, starPoints);

  playChime("victory");
  makeConfettiBurst();

  document.getElementById("screen-splash").classList.add("hidden");
  document.getElementById("screen-dashboard").classList.remove("hidden");
}

function handleInactiveGameClick(gameName) {
  showCustomAlert(
    "✨🔒",
    "Game Segera Hadir!",
    `Mainan "${gameName}" sedang dirapikan oleh Kakak Guru ya! Yuk mainkan game yang aktif: "Melengkapi Huruf"! 🥰`,
  );
}

function openBonusModal() {
  playChime("victory");
  makeConfettiBurst();

  starPoints += 50;
  document.getElementById("display-stars").innerText = starPoints;
  document.getElementById("gameplay-score-count").innerText = starPoints;
  localStorage.setItem("paud_star_points", starPoints);

  // Real-time update skor di leaderboard
  saveToLeaderboard(childName, starPoints);

  showCustomAlert(
    "🎁🎉",
    "Kejutan Bintang!",
    `Hebat! ${childName} rajin sekali belajar hari ini! Dapat bonus +50 Bintang untukmu ya! ⭐️`,
  );
}

function startPlayableSpellingGame() {
  playChime("tap");
  document.getElementById("screen-dashboard").classList.add("hidden");
  document.getElementById("screen-gameplay").classList.remove("hidden");

  activeLevel = 0;
  solvedThisSession = [];

  document.getElementById("solved-collection-history").innerHTML = `
    <div id="no-history-banner" class="w-full text-center py-4 text-slate-400 font-bold text-xs">
        Selesaikan tebakan untuk koleksi mainan! 🎁
    </div>
  `;

  document.getElementById("gameplay-score-count").innerText = starPoints;
  renderSpellingLevel();
}

function exitSpellingGame() {
  playChime("tap");
  localStorage.setItem("paud_star_points", starPoints);
  document.getElementById("display-stars").innerText = starPoints;
  saveToLeaderboard(childName, starPoints);

  document.getElementById("screen-gameplay").classList.add("hidden");
  document.getElementById("screen-dashboard").classList.remove("hidden");
}

function renderSpellingLevel() {
  const levelData = spellingLevelsData[activeLevel];
  document.getElementById("gameplay-level-badge").innerText = levelData.id;

  const percent = (activeLevel / spellingLevelsData.length) * 100;
  document.getElementById("progress-loading-fill").style.width = `${percent}%`;
  document.getElementById("active-benda-emoji").innerText = levelData.emoji;

  const lettersContainer = document.getElementById("active-letters-container");
  lettersContainer.innerHTML = "";

  const hintParts = levelData.hint.split(" ");
  hintParts.forEach((char) => {
    const charBox = document.createElement("span");
    if (char === "_") {
      charBox.innerHTML = `<span class="inline-block w-10 sm:w-12 text-center border-b-6 border-amber-500 text-rose-500 animate-pulse font-bubble text-4xl sm:text-5xl">_</span>`;
    } else {
      charBox.innerHTML = `<span class="inline-block w-10 sm:w-12 text-center border-b-6 border-slate-300 text-slate-700 font-bubble text-3xl sm:text-4xl">${char}</span>`;
    }
    lettersContainer.appendChild(charBox);
  });

  const optionsContainer = document.getElementById("options-letter-stack");
  optionsContainer.innerHTML = "";

  const optGrads = [
    "from-amber-400 to-orange-400 border-amber-600 hover:from-amber-500 hover:to-orange-500",
    "from-emerald-400 to-green-400 border-emerald-600 hover:from-emerald-500 hover:to-green-500",
    "from-sky-400 to-blue-400 border-sky-600 hover:from-sky-500 hover:to-blue-500",
    "from-purple-400 to-fuchsia-400 border-purple-600 hover:from-purple-500 hover:to-fuchsia-500",
  ];

  levelData.options.forEach((letter, index) => {
    const btn = document.createElement("button");
    btn.className = `w-full flex-grow py-3 px-4 rounded-2xl bg-gradient-to-b ${optGrads[index % optGrads.length]} border-b-5 shadow-md hover:scale-105 active:scale-95 transition-all text-white font-bubble text-3xl font-black cursor-pointer flex items-center justify-center gap-2 select-none`;
    btn.innerHTML = `${letter} <span class="text-yellow-200 text-sm hidden lg:inline">⭐️</span>`;
    btn.onclick = () => checkSelectedOption(letter, levelData.missing);
    optionsContainer.appendChild(btn);
  });
}

function checkSelectedOption(selectedLetter, correctLetter) {
  const currentData = spellingLevelsData[activeLevel];

  if (selectedLetter === correctLetter) {
    playChime("correct");
    makeConfettiBurst();

    const lettersContainer = document.getElementById(
      "active-letters-container",
    );
    lettersContainer.innerHTML = "";
    const fullLetters = currentData.text.split("");

    fullLetters.forEach((l) => {
      lettersContainer.innerHTML += `<span class="inline-block w-10 sm:w-12 text-center border-b-6 border-emerald-400 text-emerald-500 font-bubble text-3xl sm:text-4xl animate-bounce">${l}</span>`;
    });

    starPoints += 10;
    document.getElementById("gameplay-score-count").innerText = starPoints;
    localStorage.setItem("paud_star_points", starPoints);
    saveToLeaderboard(childName, starPoints);
    addSolvedToHistory(currentData);

    setTimeout(() => {
      activeLevel++;
      if (activeLevel < spellingLevelsData.length) {
        renderSpellingLevel();
      } else {
        playChime("victory");
        makeConfettiBurst();

        starPoints += 100;
        localStorage.setItem("paud_star_points", starPoints);
        saveToLeaderboard(childName, starPoints);

        showCustomAlert(
          "👑🏆",
          "Luar Biasa Hebat!",
          `Wow! ${childName} berhasil memenangkan semua level Kuis! BONUS +100 Bintang khusus Juara!`,
        );
        exitSpellingGame();
      }
    }, 1600);
  } else {
    playChime("incorrect");
    const emojiEl = document.getElementById("active-benda-emoji");
    emojiEl.classList.add("animate-bounce", "text-rose-500");

    setTimeout(() => {
      emojiEl.classList.remove("animate-bounce", "text-rose-500");
    }, 600);
  }
}

function addSolvedToHistory(itemData) {
  if (solvedThisSession.includes(itemData.id)) return;
  solvedThisSession.push(itemData.id);

  const container = document.getElementById("solved-collection-history");
  const banner = document.getElementById("no-history-banner");
  if (banner) banner.remove();

  const card = document.createElement("div");
  card.className =
    "flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100 p-2 rounded-2xl border border-emerald-200 shadow-sm animate-pulse shrink-0 lg:shrink";
  card.innerHTML = `
        <span class="text-3xl filter drop-shadow-sm">${itemData.emoji}</span>
        <span class="font-bubble text-slate-700 font-bold text-xs sm:text-sm tracking-wide uppercase">${itemData.text}</span>
        <span class="ml-auto text-emerald-500 text-xs sm:text-sm"><i class="fa-solid fa-circle-check"></i></span>
    `;
  container.appendChild(card);
  container.scrollTop = container.scrollHeight;
}

function saveToLeaderboard(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("paud_leaderboard")) || [];
  const exists = leaderboard.find(
    (x) => x.name.toLowerCase() === name.toLowerCase(),
  );

  if (exists) {
    if (score > exists.score) exists.score = score;
  } else {
    leaderboard.push({ name: name, score: score });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5); // Hanya simpan top 5 anak hebat
  localStorage.setItem("paud_leaderboard", JSON.stringify(leaderboard));
}

function openLeaderboard() {
  playChime("tap");
  document.getElementById("screen-dashboard").classList.add("hidden");
  document.getElementById("screen-leaderboard").classList.remove("hidden");

  const body = document.getElementById("leaderboard-table-body");
  body.innerHTML = "";

  let leaderboard = JSON.parse(localStorage.getItem("paud_leaderboard")) || [];

  // Jika data kosong, tampilkan baris informasi ramah alih-alih merusak sort data
  if (leaderboard.length === 0) {
    body.innerHTML = `<div class="text-center py-4 text-slate-400 font-bold text-sm">Belum ada anak pintar yang masuk papan peringkat. Yuk jadilah yang pertama! 🏆</div>`;
    return;
  }

  leaderboard.sort((a, b) => b.score - a.score);
  const medalList = ["🥇", "🥈", "🥉", "🏅", "🏅"];

  leaderboard.forEach((user, index) => {
    const row = document.createElement("div");
    row.className =
      "flex justify-between items-center py-3 text-slate-700 font-bold border-b border-amber-100/50 last:border-none";
    row.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-xl">${medalList[index] || "⭐️"}</span>
                <span class="font-bubble text-md ${user.name === childName ? "text-indigo-900 font-black" : "text-slate-600"}">${user.name}</span>
            </div>
            <span class="font-bubble text-md text-amber-500">⭐️ ${user.score}</span>
        `;
    body.appendChild(row);
  });
}

function closeLeaderboard() {
  playChime("tap");
  document.getElementById("screen-leaderboard").classList.add("hidden");
  document.getElementById("screen-dashboard").classList.remove("hidden");
}

// ==========================================
// 5. APPLICATION INITIALIZATION ENTRY
// ==========================================
window.onload = function () {
  initAppStorage();
};
