const base_api = "https://www.sankavollerei.com/anime/";
const detailContainer = document.getElementById("detail-container");

const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get("id");
document.title = animeId;

if (!animeId) {
  detailContainer.innerText = "Maaf, anime tidak ditemukan.";
} else {
  getDetailAnime(animeId);
}

async function getDetailAnime(id) {
  try {
    const res = await fetch(`${base_api}samehadaku/anime/${id}`);
    const data = await res.json();

    if (!data.data) {
      detailContainer.innerText = "Detail anime tidak tersedia.";
      return;
    }

    const anime = data.data;

    detailContainer.innerHTML = `
      <div class="w-screen items-center md:items-start rounded-lg flex flex-col md:flex-row">
      <div class="w-full h-[30vh]">
      <img
    src="${anime.poster}"
    alt="${anime.japanese}"
    class="object-cover w-[30vh] md:w-[50vh] rounded-md mb-5 md:mb-0 md:mr-5"
  />
  </div>
  <div class="flex flex-col flex-grow">
    <h1 class="font-bold text-md">
      ${anime.japanese}
    </h1>
    <h1 class="text-sm mt-1">${anime.english}</h1>

    <p class="mt-4 text-justify text-sm leading-relaxed max-w-full md:max-w-[600px]">
      <span class="font-semibold">Sninopsis:</span> ${anime.synopsis.paragraphs.join("<br><br>")}
    </p>

    <div class="bg-gray-100 p-2 mt-2 mb-2">
    <p class="text-xs text-black mb-1">Status: ${anime.status}</p>
    <p class="text-xs text-black mb-1">Skor: ${anime.score.value}</p>
    <p class="text-xs text-black mb-1">Studio: ${anime.studios}</p>
    <p class="text-xs text-black mb-1">Tipe: ${anime.type}</p>
    <p class="text-xs text-black">Durasi: ${anime.duration}</p>
    </div>

    <div class="flex flex-wrap gap-2">
    Genre:
      ${anime.genreList
        .map(
          (genre) =>
            `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">${genre.title}</span>`
        )
        .join("")}
    </div>

    <div class="mt-2 flex flex-col bg-gray-100 pt-2 pl-2 overflow-y-auto h-[300px]">
      ${anime.episodeList
        .map(
          (eps) =>
            `<a href="nonton.html?id=${eps.episodeId}" class="text-start bg-white inline-block text-purple-800 text-sm md:text-lg px-3 py-1 rounded mr-2 mb-1 hover:bg-purple-100 transition">Episode: ${eps.title}</a>`
        )
        .join("")}
    </div>
  </div>
</div>
    `;
  } catch (error) {
    console.error(error);
    detailContainer.innerText = "Gagal mengambil detail anime.";
  }
}














