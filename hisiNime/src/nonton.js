const API = "https://www.sankavollerei.com/anime/";
const container = document.getElementById("container");
const rekomen = document.getElementById("rekomen");

const animeId = new URLSearchParams(location.search).get("id");
document.title = animeId || "Streaming";

if (!animeId) {
  container.innerText = "Maaf, streaming tidak ditemukan";
} else {
  loadStreaming(animeId);
}

async function loadStreaming(id) {
  try {
    const res = await fetch(`${API}samehadaku/episode/${id}`);
    const { data } = await res.json();
    if (!data) return (container.innerText = "Streaming anime tidak tersedia.");

    // Buat struktur halaman
    container.innerHTML = `
      <a class="bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="./index.html">Kembali</a>
      <h1 class="mt-5 font-bold text-xl text-center mb-4">${data.title}</h1>

      <!-- Navigasi episode -->
      <div class="flex justify-between mt-3 w-full">
        <a class="bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="?id=${data.prevEpisode?.episodeId || '#'}"><< Sebelumnya</a>
        <a class="bg-gray-100 text-center p-2 ml-2 rounded text-purple-500 hover:bg-purple-100 transition" href="?id=${data.nextEpisode?.episodeId || '#'}">Selanjutnya >></a>
      </div>

      <!-- Player Video -->
      <div class="relative mt-4">
        <video id="player" class="w-full rounded shadow" controls></video>
      </div>

      <!-- Quality & Server -->
      <div id="qualities" class="mt-4 flex flex-wrap gap-2"></div>
      <div id="servers" class="mt-3 flex flex-wrap gap-2"></div>
    `;

    rekomen.innerHTML = `
    <!-- Rekomendasi Episode -->
    <div class="mt-8 bg-gray-100 rounded p-3 overflow-y-auto h-[500px]">
      <span class="font-semibold text-purple-500 block mb-3">Rekomendasi Episode:</span>
      ${data.recommendedEpisodeList
        .map(
          (eps) => `
        <div class="flex mb-2 items-center gap-3 hover:bg-gray-200 rounded p-1 transition">
          <img class="w-auto h-[50px] rounded" src="${eps.poster}" alt="no-img">
          <a href="nonton.html?id=${eps.episodeId}" class="flex-1 text-purple-800 text-sm md:text-lg h-[50px] bg-white px-3 py-1 rounded hover:bg-purple-100 transition">
            ${eps.title}
          </a>
        </div>
      `
        )
        .join("")}
    </div>`;

    renderQualities(data.server.qualities);
    setupProgressSave();
  } catch (err) {
    console.error(err);
    container.innerText = "Gagal mengambil streaming anime.";
  }
}

function renderQualities(qualities) {
  const qEl = document.getElementById("qualities");
  qEl.innerHTML = "";

  let targetButton = null;
  const savedResolution = localStorage.getItem("preferredResolution");

  qualities.forEach(q => {
    if (!q.serverList?.length) return;

    const btn = createButton(q.title, () => {
      localStorage.setItem("preferredResolution", q.title);
      renderServers(q.serverList);
    });

    qEl.appendChild(btn);

    if (savedResolution && q.title === savedResolution) targetButton = btn;
    if (!savedResolution && q.title.includes("720")) targetButton = btn;
  });

  if (targetButton) {
    targetButton.click();
  } else {
    qEl.querySelector("button")?.click();
  }
}

function renderServers(servers) {
  const sEl = document.getElementById("servers");
  const player = document.getElementById("player");
  sEl.innerHTML = "";

  servers.forEach(s => {
    const btn = createButton(s.title, async () => {
      if (s.serverId.startsWith("http")) {
        player.src = s.serverId;
      } else {
        try {
          const res = await fetch(`${API}samehadaku/server/${s.serverId}`);
          const json = await res.json();
          if (json?.data?.url) {
            player.src = json.data.url;
          } else {
            player.src = "";
            alert("URL streaming tidak ditemukan.");
          }
        } catch (e) {
          console.error(e);
          alert("Gagal memuat server.");
        }
      }
      checkResumeProgress();
    });
    sEl.appendChild(btn);
  });

  sEl.querySelector("button")?.click();
}

// 🕒 Simpan progress nonton
function setupProgressSave() {
  const player = document.getElementById("player");
  const key = `progress_${animeId}`;

  // Simpan progress setiap 5 detik
  player.addEventListener("timeupdate", () => {
    if (!isNaN(player.currentTime)) {
      localStorage.setItem(key, player.currentTime);
    }
  });

  // Hapus progress saat selesai nonton
  player.addEventListener("ended", () => {
    localStorage.removeItem(key);
  });
}

// 🎬 Cek apakah ada progress sebelumnya
function checkResumeProgress() {
  const player = document.getElementById("player");
  const key = `progress_${animeId}`;
  const lastTime = localStorage.getItem(key);

  if (lastTime) {
    const resumeBtn = document.createElement("button");
    resumeBtn.textContent = `Lanjut dari ${formatTime(lastTime)}`;
    resumeBtn.className = "mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600";
    resumeBtn.addEventListener("click", () => {
      player.currentTime = parseFloat(lastTime);
      player.play();
      resumeBtn.remove();
    });
    player.parentElement.prepend(resumeBtn);
  }
}

function formatTime(sec) {
  sec = parseInt(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className = "px-2 py-1 bg-gray-200 rounded hover:bg-purple-200";
  btn.addEventListener("click", () => {
    btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("bg-purple-500","text-white"));
    btn.classList.add("bg-purple-500","text-white");
    onClick();
  });
  return btn;
}
