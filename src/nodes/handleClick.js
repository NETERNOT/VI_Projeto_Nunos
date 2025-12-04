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
      });
  }

  // Genre click handler
  for (let genre of genreData) {
    circles
      .filter((d) => d.id === genre.id)
      .on("click", function () {
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