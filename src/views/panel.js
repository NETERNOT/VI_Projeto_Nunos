export function search(
  bands,
  genres,
  input,
  resultsInput,
  getSearchResults,
  bandInfoUpdate,
  updateFanSpread
) {
  input.addEventListener("input", async () => {
    const query = input.value.trim().toLowerCase();

    if (query.length === 0) {
      resultsInput.innerHTML = "";
      return;
    }

    const results = (await getSearchResults(bands, genres, query)) || {
      bands: [],
      genres: [],
    };

    //build results HTML
    let resultsHtml = "";

    if (results.bands && results.bands.length > 0) {
      resultsHtml += "<h3>Bands</h3><ul id='search-band-list'>";
      results.bands.forEach((band) => {
        const bandId = band.id || band.name || "";
        if (!bandId) return;
        resultsHtml += `<li class="search-band-item" data-band-id="${bandId}">${bandId}</li>`;
      });
      resultsHtml += "</ul>";
    }

    if (results.genres && results.genres.length > 0) {
      resultsHtml += "<h3>Genres</h3><ul id='search-genre-list'>";
      results.genres.forEach((genre) => {
        const genreId = genre.id || "";
        if (!genreId) return;
        resultsHtml += `<li class="search-genre-item" data-genre-id="${genreId}">${genreId}</li>`;
      });
      resultsHtml += "</ul>";
    }

    resultsInput.innerHTML = resultsHtml;

    //add click listeners to results
    document.querySelectorAll(".search-band-item").forEach((item) => {
      item.addEventListener("click", () => {
        const bandId = item.getAttribute("data-band-id");
        const bandNode = bands.find(
          (b) => b.id.toLowerCase() === bandId.toLowerCase()
        );
        if (bandNode) {
          //clear genre spread when selecting a band
          document.querySelector(".spread-container").innerHTML = "";

          const selectedPanel = document.getElementById("selected-panel");
          const selectedPanelText = document.getElementById(
            "selected-panel-text"
          );

          selectedPanel.style.display = "flex";
          selectedPanelText.textContent = "Band: " + bandNode.band_name;

          bandInfoUpdate(bandNode);
          //mirror band click behavior: highlight this band and its genres; dim others
          for (let genre of genres) {
            if (bandNode.style && bandNode.style.includes(genre.id)) {
              d3.selectAll(".genre-group")
                .filter((d) => d.id === genre.id)
                .attr("opacity", 1.0);
            } else {
              d3.selectAll(".genre-group")
                .filter((d) => d.id === genre.id)
                .attr("opacity", 0.2);
            }
          }

          d3.selectAll(".band-group").attr("opacity", (d) => {
            if (d.id === bandNode.id) return 1.0;
            return 0.2;
          });
        }
        resultsInput.innerHTML = "";
        input.value = "";
      });
    });

    document.querySelectorAll(".search-genre-item").forEach((item) => {
      item.addEventListener("click", () => {
        const genreId = item.getAttribute("data-genre-id");
        const genreNode = genres.find(
          (g) => g.id.toLowerCase() === genreId.toLowerCase()
        );
        if (genreNode) {
          //clear band info aside when selecting a genre
          document.querySelector("aside").classList.toggle("active", 0);

          const selectedPanel = document.getElementById("selected-panel");
          const selectedPanelText = document.getElementById(
            "selected-panel-text"
          );

          selectedPanel.style.display = "flex";
          selectedPanelText.textContent = "Genre: " + genreNode.id;

          updateFanSpread(genreNode.fans);
          //mirror genre click behavior: highlight this genre and its bands; dim others
          for (let j = 0; j < bands.length; j++) {
            if (bands[j].style && bands[j].style.includes(genreNode.id)) {
              d3.selectAll(".band-group")
                .filter((d) => d.id === bands[j].id)
                .attr("opacity", 1.0);
            } else {
              d3.selectAll(".band-group")
                .filter((d) => d.id === bands[j].id)
                .attr("opacity", 0.2);
            }
          }

          d3.selectAll(".genre-group").attr("opacity", (d) => {
            if (d.id === genreNode.id) return 1.0;
            return 0.2;
          });
        }
        resultsInput.innerHTML = "";
        input.value = "";
      });
    });
  });
}

export function settings(type) {
  const settingsPanel = document.getElementById("settings-panel");
  const settingsButton = document.getElementById("settings-button");

  settingsButton.addEventListener("click", () => {
    settingsPanel.style.display =
      settingsPanel.style.display === "flex" ? "none" : "flex";
  });
}
