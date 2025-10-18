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

    container.innerHTML = `
  <a class="bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="./index.html">Kembali</a>

  <h1 class="mt-5 font-bold text-xl text-center mb-4">${data.title}</h1>

  <!-- Navigasi episode -->
  <div class="flex justify-between mt-3 w-full">
    <a class="bg-gray-100 text-center p-2 mr-2 rounded text-purple-500 hover:bg-purple-100 transition" href="?id=${data.prevEpisode?.episodeId || '#'}">⬅ Sebelumnya</a>
    <a class="bg-gray-100 text-center p-2 ml-2 rounded text-purple-500 hover:bg-purple-100 transition" href="?id=${data.nextEpisode?.episodeId || '#'}">Selanjutnya ➡</a>
  </div>

  <!-- Player Wrapper + Next Button Overlay -->
  <div class="relative mt-4">
    <iframe id="player" class="w-full aspect-video rounded shadow" src="" frameborder="0" allowfullscreen></iframe>

    <button id="nextEpisodeBtn"
      class="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition">
      Next Episode ▶
    </button>
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
</div>`

    renderQualities(data.server.qualities);
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
      // simpan resolusi yang dipilih user
      localStorage.setItem("preferredResolution", q.title);
      renderServers(q.serverList);
    });

    qEl.appendChild(btn);

    // kalau resolusi sama dengan yang tersimpan
    if (savedResolution && q.title === savedResolution) {
      targetButton = btn;
    }

    // fallback ke 720p jika belum ada tersimpan
    if (!savedResolution && q.title.includes("720")) {
      targetButton = btn;
    }
  });

  // klik target button (resolusi tersimpan atau 720p), kalau tidak ada klik pertama
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
      console.log("🟡 Server ID terpilih:", s.serverId);

      // kalau serverId sudah URL, pakai langsung
      if (s.serverId.startsWith("http")) {
        player.src = s.serverId;
      } else {
        // ambil URL asli dari server ID via API
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
    });
    sEl.appendChild(btn);
  });
  sEl.querySelector("button")?.click(); // auto pilih server pertama
}

// fungsi bantu bikin button
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












