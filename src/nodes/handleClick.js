import { getBandInfo } from "../data/getBandInfo.js";

export function handleClick(
  bandNodes,
  bandCircles,
  circles,
  genreData,
  filterSettings = null,
  applyBandFilters = null
) {
  // Band click handler
  for (let band of bandNodes) {
    bandCircles
      .filter((d) => d.id === band.id)
      .on("click", function () {
        document.querySelector(".spread-container").innerHTML = "";

        let bandOrGenre = "band";
        console.log(bandOrGenre);

        let selectedBand = band;
        const selectedPanel = document.getElementById("selected-panel");
        const selectedPanelText = document.getElementById(
          "selected-panel-text"
        );

        if (bandOrGenre !== null) {
          selectedPanel.style.display = "flex";
          selectedPanelText.textContent = "Band: " + band.band_name;
        }

        // Highlight genres of selected band
        for (let genre of genreData) {
          if (band.style.includes(genre.id)) {
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
          if (selectedBand && d.id === selectedBand.id) {
            return 1.0;
          } else if (selectedBand) {
            //check if this band should be visible based on filters
            if (filterSettings && applyBandFilters) {
              const filteredBands = applyBandFilters([d], filterSettings);
              return filteredBands.length > 0 ? 0.2 : 0;
            }
            return 0.2;
          }
        });

        bandInfoUpdate(selectedBand);
      });
  }

  // Genre click handler
  for (let genre of genreData) {
    circles
      .filter((d) => d.id === genre.id)
      .on("click", function () {
        //hide aside
        document.querySelector("aside").classList.toggle("active", 0);

        console.log("Genre clickes countries: ", genre.fans.countries);
        updateFanSpread(genre.fans);

        let bandOrGenre = "genre";
        console.log(bandOrGenre);

        let selectedGenre = genre;

        const selectedPanel = document.getElementById("selected-panel");
        const selectedPanelText = document.getElementById(
          "selected-panel-text"
        );

        if (bandOrGenre !== null) {
          selectedPanel.style.display = "flex";
          selectedPanelText.textContent = "Genre: " + genre.id;
        }

        // Highlight bands of selected genre
        for (let j = 0; j < bandNodes.length; j++) {
          if (bandNodes[j].style.includes(genre.id)) {
            d3.selectAll(".band-group")
              .filter((d) => d.id === bandNodes[j].id)
              .attr("opacity", 1.0);
          } else {
            //check if this band should be visible based on filters
            const opacity =
              filterSettings &&
              applyBandFilters &&
              applyBandFilters([bandNodes[j]], filterSettings).length > 0
                ? 0.2
                : 0;
            d3.selectAll(".band-group")
              .filter((d) => d.id === bandNodes[j].id)
              .attr("opacity", opacity);
          }
        }

        d3.selectAll(".genre-group").attr("opacity", (d) => {
          if (selectedGenre && d.id === selectedGenre.id) {
            return 1.0;
          } else if (selectedGenre) {
            return 0.2;
          }
        });
      });
  }
}

export async function bandInfoUpdate(selectedBand) {
  const aside = document.querySelector("aside");

  clearBandInfo(aside);

  const info = await getBandInfo(selectedBand.band_name);

  let img = document.createElement("img");

  const priorityOrder = [
    "strArtistWideThumb",
    "strArtistThumb",
    "strArtistLogo",
    "strArtistCutout",
    "strArtistClearart",
    "strArtistFanart",
    "strArtistFanart2",
    "strArtistFanart3",
    "strArtistFanart4",
    "strArtistBanner",
  ];

  for (let key of priorityOrder) {
    if (info[key]) {
      img.src = info[key];
      break;
    }
  }

  let name = document.createElement("h2");
  name.id = "aside-band-name";
  name.textContent = selectedBand.band_name;

  let originAndDate = document.createElement("p");
  originAndDate.classList.add("aside-text");
  originAndDate.textContent = `${selectedBand.origin}, ${
    selectedBand.formed
  } - ${selectedBand.split === "-" ? "Present" : selectedBand.split}`;

  let genres = document.createElement("p");
  genres.classList.add("aside-text");
  let genreStr = selectedBand.style.join(", ");
  genres.textContent = genreStr;

  let bio = document.createElement("p");
  bio.classList.add("aside-text");
  bio.textContent = info.strBiographyEN;

  aside.appendChild(img);
  aside.appendChild(name);
  aside.appendChild(originAndDate);
  aside.appendChild(genres);
  aside.appendChild(bio);

  aside.classList.toggle("active", 1);
}

function clearBandInfo(aside) {
  //clear all content
  aside.innerHTML = "";

  //add back arrow
  let backArrow = document.createElement("div");
  backArrow.id = "back-arrow";
  backArrow.textContent = "<-";
  backArrow.addEventListener("click", () => {
    aside.classList.toggle("active", 0);
  });

  aside.appendChild(backArrow);
}

export function updateFanSpread(fans) {
  let spreadContainer = document.querySelector(".spread-container");
  spreadContainer.innerHTML = "";

  spreadContainer.classList.toggle("active", 1);

  const list = fans.countries.sort((a, b) => b.fans - a.fans);

  const countryToFlag = {
    USA: "🇺🇸",
    "United States": "🇺🇸",
    Sweden: "🇸🇪",
    "United Kingdom": "🇬🇧",
    Finland: "🇫🇮",
    Germany: "🇩🇪",
    Poland: "🇵🇱",
    Norway: "🇳🇴",
    "The Netherlands": "🇳🇱",
    Netherlands: "🇳🇱",
    France: "🇫🇷",
    Brazil: "🇧🇷",
    Portugal: "🇵🇹",
    Switzerland: "🇨🇭",
    Austria: "🇦🇹",
    Australia: "🇦🇺",
    Canada: "🇨🇦",
    Greece: "🇬🇷",
    Israel: "🇮🇱",
    Denmark: "🇩🇰",
    Ireland: "🇮🇪",
    Italy: "🇮🇹",
    Russia: "🇷🇺",
    Ukraine: "🇺🇦",
    "Faroe Islands": "🇫🇴",
  };

  for (let entry of list) {
    let countryDiv = document.createElement("div");
    countryDiv.classList.add("country-div");

    let bar = document.createElement("span");
    bar.style.width = `${(entry.fans / fans.total) * 30}%`;
    bar.classList.add("bar");

    let label = document.createElement("span");
    label.textContent = `${countryToFlag[entry.country] || entry.country}`;

    countryDiv.appendChild(bar);
    countryDiv.appendChild(label);
    spreadContainer.appendChild(countryDiv);
  }
}
