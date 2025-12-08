import { renderAreaGraph } from "./timeline.js";

//helper function to apply filters to bands
export function applyBandFilters(bands, filterSettings) {
  return bands.filter((band) => {
    //filter by country if set
    if (filterSettings.country) {
      const bandCountry = (band.origin || "").trim().toLowerCase();
      if (bandCountry !== filterSettings.country.toLowerCase()) {
        return false;
      }
    }

    //filter by decade if set
    if (filterSettings.decade) {
      const formed = parseInt(band.formed);
      const decadeStart = filterSettings.decade;
      const decadeEnd = decadeStart + 9;
      if (!(formed >= decadeStart && formed <= decadeEnd)) {
        return false;
      }
    }

    return true;
  });
}

export function search(
  bands,
  genres,
  input,
  resultsInput,
  getSearchResults,
  bandInfoUpdate,
  updateFanSpread,
  filterSettings = { searchBy: "both", country: null, decade: null }
) {
  input.addEventListener("input", async () => {
    const query = input.value.trim().toLowerCase();

    if (query.length === 0) {
      resultsInput.innerHTML = "";
      return;
    }

    let results = (await getSearchResults(bands, genres, query)) || {
      bands: [],
      genres: [],
    };

    //apply filters based on settings
    if (filterSettings.searchBy === "bands") {
      results.genres = [];
    } else if (filterSettings.searchBy === "genres") {
      results.bands = [];
    }

    //apply country and decade filters to search results
    if (results.bands.length > 0) {
      results.bands = applyBandFilters(results.bands, filterSettings);
    }

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

          renderAreaGraph(bandNode, genres);
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

export function settings(bands, genres, search) {
  const settingsPanel = document.getElementById("settings-panel");
  const settingsButton = document.getElementById("settings-button");

  //filter settings object (shared reference)
  const filterSettings = {
    searchBy: "both",
    country: null,
    decade: null,
  };

  settingsButton.addEventListener("click", () => {
    settingsPanel.style.display =
      settingsPanel.style.display === "flex" ? "none" : "flex";
  });

  //search by filter
  const searchByDropdown = document.getElementById("search-by-dropdown");
  if (searchByDropdown) {
    searchByDropdown.addEventListener("change", (e) => {
      filterSettings.searchBy = e.target.value;
      console.log("Search by updated:", filterSettings.searchBy);
    });
  }

  //country filter - build dropdown from bands data
  const countrySelect = document.getElementById("country-select");
  if (countrySelect) {
    const countries = [
      ...new Set(bands.map((b) => (b.origin || "").trim()).filter(Boolean)),
    ].sort();

    //clear existing options (except the first placeholder)
    while (countrySelect.options.length > 1) {
      countrySelect.remove(1);
    }

    //add country options
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });

    countrySelect.addEventListener("change", (e) => {
      filterSettings.country = e.target.value || null;
      console.log("Country filter updated:", filterSettings.country);
    });
  }

  //decade filter - build dropdown from bands data
  const decadeSelect = document.getElementById("decade-select");
  if (decadeSelect) {
    const decades = [
      ...new Set(
        bands
          .map((b) => {
            const year = parseInt(b.formed);
            return Math.floor(year / 10) * 10;
          })
          .filter((d) => !isNaN(d))
      ),
    ].sort((a, b) => a - b);

    //clear existing options (except the first placeholder)
    while (decadeSelect.options.length > 1) {
      decadeSelect.remove(1);
    }

    //add decade options
    decades.forEach((decade) => {
      const option = document.createElement("option");
      option.value = decade;
      option.textContent = `${decade}s`;
      decadeSelect.appendChild(option);
    });

    decadeSelect.addEventListener("change", (e) => {
      filterSettings.decade = e.target.value ? parseInt(e.target.value) : null;
      console.log("Decade filter updated:", filterSettings.decade);
    });
  }

  return filterSettings;
}
