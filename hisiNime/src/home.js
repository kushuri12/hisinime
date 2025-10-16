const base_api = "https://www.sankavollerei.com/anime/";
let isLoadingCompleted = false;
let isLoadingOngoing = false;

async function home_anime() {
  if (isLoadingCompleted) return;
  isLoadingCompleted = true;
  document.getElementById("loading").style.display = "block";

  try {
    const res = await fetch(`${base_api}samehadaku/completed`);
    const data = await res.json();
    if (data?.data?.animeList) {
      displayAnime(data.data.animeList, "anime-card");
    } else {
      document.getElementById("anime-card").innerText = "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data completed:", err);
    document.getElementById("anime-card").innerText = "Gagal mengambil data anime.";
  } finally {
    document.getElementById("loading").style.display = "none";
    isLoadingCompleted = false;
  }
}

async function home_anime2() {
  if (isLoadingOngoing) return;
  isLoadingOngoing = true;
  document.getElementById("loading").style.display = "block";

  try {
    const res = await fetch(`${base_api}samehadaku/ongoing`);
    const data = await res.json();
    if (data?.data?.animeList) {
      displayAnime(data.data.animeList, "anime-on");
    } else {
      document.getElementById("anime-on").innerText = "Data anime tidak ditemukan.";
    }
  } catch (err) {
    console.error("Gagal mengambil data ongoing:", err);
    document.getElementById("anime-on").innerText = "Gagal mengambil data anime.";
  } finally {
    document.getElementById("loading").style.display = "none";
    isLoadingOngoing = false;
  }
}

function displayAnime(animeList, targetId) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = "";

  animeList.forEach(anime => {
    const card = document.createElement("div");
    card.className = `
      min-w-[200px] max-w-[200px] bg-white rounded-lg shadow-md p-3 
      snap-start flex flex-col hover:shadow-lg transition-shadow
    `;
    card.innerHTML = `
      <a href="detail.html?id=${anime.animeId}">
        <img src="${anime.poster}" alt="${anime.title}"
          class="w-full h-auto rounded mb-3 object-cover" />
        <div class="flex flex-col items-start">
          <h3 class="font-bold text-sm mb-1 line-clamp-2">${anime.title}</h3>
          <p class="text-xs text-gray-600">Tipe: ${anime.type}</p>
          <p class="text-xs text-gray-600">Skor: ${anime.score}</p>
          <p class="text-xs text-gray-600 mb-2">Status: ${anime.status}</p>
        </div>
      </a>
    `;
    grid.appendChild(card);
  });
}

const searchInput = document.getElementById("searchInput");
const searchResult = document.getElementById("anime-search");

searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();

  if (!query) {
    searchResult.innerHTML = ""; // kosongin hasil saat input kosong
    return;
  }

  try {
    const res = await fetch(`${base_api}samehadaku/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data?.data?.animeList?.length) {
      renderSearch(data.data.animeList);
    } else {
      searchResult.innerHTML = "<p class='text-gray-500'>Anime tidak ditemukan</p>";
    }
  } catch (err) {
    console.error(err);
    searchResult.innerHTML = "<p class='text-red-500'>Gagal mengambil data</p>";
  }
});

function renderSearch(list) {
  searchResult.innerHTML = "";
  list.forEach(anime => {
    const card = document.createElement("div");
    card.className = "min-w-[150px] max-w-[150px] bg-white rounded-lg shadow-md p-3 snap-start flex flex-col hover:shadow-lg transition-shadow";

    card.innerHTML = `
      <a href="detail.html?id=${anime.animeId}">
        <img src="${anime.poster}" alt="${anime.title}" class="rounded mb-2 w-full">
        <h3 class="font-semibold text-sm line-clamp-2">${anime.title}</h3>
      </a>
    `;

    searchResult.appendChild(card);
  });
}

function enableHorizontalScroll(id) {
  const container = document.getElementById(id);
  container.addEventListener('wheel', (evt) => {
    evt.preventDefault();
    container.scrollLeft += evt.deltaY;
  });
}

window.addEventListener("DOMContentLoaded", () => {
  home_anime();
  home_anime2();
  enableHorizontalScroll("anime-card");
  enableHorizontalScroll("anime-on");
});
