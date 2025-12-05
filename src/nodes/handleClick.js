import { getBandInfo } from "../data/getBandInfo.js"

export function handleClick(bandNodes, bandCircles, circles, genreData) {

  // Band click handler
  for (let band of bandNodes) {
    bandCircles
      .filter((d) => d.id === band.id)
      .on("click", function () {
        let bandOrGenre = "band";
        console.log(bandOrGenre);

        let selectedBand = band;

        const selectedBandText = document.getElementById("selected-band-text");
        const selectedGenreText = document.getElementById("selected-genre-text");

        selectedBandText.textContent = "Band: " + band.band_name;
        selectedGenreText.textContent = "Genre";

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
            return 0.2;
          }
        });

        bandInfoUpdate(selectedBand)

      });
  }

  // Genre click handler
  for (let genre of genreData) {
    circles
      .filter((d) => d.id === genre.id)
      .on("click", function () {
        //hide aside
        document.querySelector("aside").classList.toggle("active",0)


        let bandOrGenre = "genre";
        console.log(bandOrGenre);

        let selectedGenre = genre;
        let selectedBand = null;

        const selectedBandText = document.getElementById("selected-band-text");
        const selectedGenreText = document.getElementById("selected-genre-text");

        selectedGenreText.textContent = "Genre: " + genre.id;
        selectedBandText.textContent = "Band";

        // Highlight bands of selected genre
        for (let j = 0; j < bandNodes.length; j++) {
          if (bandNodes[j].style.includes(genre.id)) {
            d3.selectAll(".band-group")
              .filter((d) => d.id === bandNodes[j].id)
              .attr("opacity", 1.0);
          } else {
            d3.selectAll(".band-group")
              .filter((d) => d.id === bandNodes[j].id)
              .attr("opacity", 0.2);
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


async function  bandInfoUpdate(selectedBand){
    const aside = document.querySelector("aside")

    clearBandInfo(aside)

    const info = await getBandInfo(selectedBand.band_name)

    let img = document.createElement("img")

    img.src = (info.strArtistWideThumb ? info.strArtistWideThumb : info-strArtistThumb)

    let name = document.createElement("h2")
    name.textContent = selectedBand.band_name

    let originAndDate = document.createElement("p")
    originAndDate.textContent = `${selectedBand.origin}, ${selectedBand.formed} - ${selectedBand.split === "-" ? "Present" : selectedBand.split}`

    let genres = document.createElement("p")
    let genreStr = selectedBand.style.join(", ")
    genres.textContent = genreStr

    let bio = document.createElement("p")
    bio.textContent = info.strBiographyEN

    aside.appendChild(img)
    aside.appendChild(name)
    aside.appendChild(originAndDate)
    aside.appendChild(genres)
    aside.appendChild(bio)

    aside.classList.toggle("active", 1)
 
}

function clearBandInfo(aside){
    //clear all content
    aside.innerHTML = ""

    //add back arrow
    let backArrow = document.createElement("div")
    backArrow.id = "back-arrow"
    backArrow.textContent = "<-"
    backArrow.addEventListener("click", ()=>{
        aside.classList.toggle("active", 0)
    })

    aside.appendChild(backArrow)
}