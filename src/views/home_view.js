import { createNodes } from "../nodes/createNodes.js";
import { extractBands } from "../data/extractBands.js";
import { forceSimulation } from "../nodes/forceSimulation.js";
import { updateSimulation } from "../nodes/nodeMovement.js";

export class HomeView {
  constructor(container, rawData, genreData) {
    this.container = container;
    this.rawData = rawData;
    this.genreData = genreData;

    this.zoomScale = 1; //initial zoom scale
    this.minZoom = 0.2;
    this.maxZoom = 4;
    this.zoomStep = 0.2;

    this.travelSpeed = 0.0025; //speed of band travel between genres

    //canvas dimensions to use full window
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
  }

  render() {
    //D3 rendering

    //create main SVG container using full window dimensions
    const mainSvg = d3
      .select(this.container)
      .append("svg")
      .attr("width", this.canvasWidth)
      .attr("height", this.canvasHeight)
      .style("background-color", "#232324");

    //create zoomable group
    this.zoomGroup = mainSvg.append("g").attr("class", "zoom-group");

    //store reference to this for use in zoom function
    const self = this;

    function zoomed(event) {
      const { transform } = event;
      self.zoomGroup
        .attr("transform", transform)
        .attr("stroke-width", 5 / transform.k);

      // Change text opacity based on zoom scale (transform.k)
      const minZoom = 1.0; // Start fading in at 1x zoom
      const maxZoom = 2.0; // Full opacity at 2x zoom

      // Calculate opacity: 0 when k < minZoom, 1 when k >= maxZoom
      const textOpacity = Math.min(
        1,
        Math.max(0, (transform.k - minZoom) / (maxZoom - minZoom))
      );

      self.zoomGroup.selectAll(".band-text").attr("opacity", textOpacity);
    }

    //create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([this.minZoom, this.maxZoom])
      .translateExtent([
        [-200, -200],
        [this.canvasWidth + 200, this.canvasHeight + 200],
      ])
      .on("zoom", zoomed);

    //call the zoom behavior on the main SVG
    mainSvg.call(zoom);

    //store zoom behavior for button controls
    this.zoom = zoom;
    this.mainSvg = mainSvg;

    //create circles first
    const circles = createNodes(this.genreData, this.zoomGroup, "genre");

    //set up force simulation for the genre nodes
    forceSimulation(
      this.genreData,
      circles,
      -8,
      this.canvasWidth,
      this.canvasHeight
    );

    //USAR O X E O Y DOS circles PARA O ALGORITMO DAS BANDAS ANDAR ENTRE ELES
    //BANDS RENDER HERE
    // ------------------------------------------------------

    const bandNodes = extractBands(this.rawData, {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      genreData: this.genreData,
    });
    console.log("Tranformar Nisto:", bandNodes);

    //create band circles
    const bandCircles = createNodes(bandNodes, this.zoomGroup, "band");

    //selected band and genre for interaction
    let bandOrGenre = null;
    let selectedBand = null;
    let selectedGenre = null;

    //add click interaction to display selected band and genre
    for (let i = 0; i < bandNodes.length; i++) {
      bandCircles
        .filter((d) => d.id === bandNodes[i].id)
        .on("click", function () {
          bandOrGenre = "band";
          console.log(bandOrGenre);

          if (bandOrGenre === "band") {
            selectedGenre = null;

            const selectedBandText =
              document.getElementById("selected-band-text");
            const selectedGenreText = document.getElementById(
              "selected-genre-text"
            );

            selectedBandText.textContent = "Band: " + bandNodes[i].band_name;
            selectedGenreText.textContent = "Genre";
            selectedBand = bandNodes[i];

            //highlight genres of selected band
            if (selectedGenre === null) {
              for (let genre of self.genreData) {
                if (bandNodes[i].style.includes(genre.id)) {
                  d3.selectAll(".genre-group")
                    .filter((d) => d.id === genre.id)
                    .attr("opacity", 1.0);
                } else {
                  d3.selectAll(".genre-group")
                    .filter((d) => d.id === genre.id)
                    .attr("opacity", 0.2);
                }
              }
            }
          }

          let transitionProgressPlaceholder = bandNodes[i].transitionProgress;
          let angularVelocityPlaceholder = bandNodes[i].angularVelocity;

          d3.selectAll(".band-group").attr("opacity", (d) => {
            if (selectedBand && d.id === selectedBand.id) {
              return 1.0; //highlight selected band
            } else if (selectedBand) {
              return 0.2; //dim other bands
            }
          });
        });
    }

    bandCircles.on("mouseover", function (event, d) {
      if (d.state === "orbiting") {
        d.originalAngularVelocity = d.angularVelocity;
        d.angularVelocity = 0;
      } else if (d.state === "traveling") {
        d.isPaused = true;
      }
    });

    bandCircles.on("mouseleave", function (event, d) {
      if (d.state === "orbiting") {
        d.angularVelocity = d.originalAngularVelocity;
      } else if (d.state === "traveling") {
        d.isPaused = false;
      }
    });

    for (let genre of this.genreData) {
      circles
        .filter((d) => d.id === genre.id)
        .on("click", function () {
          bandOrGenre = "genre";
          console.log(bandOrGenre);

          if (bandOrGenre === "genre") {
            const selectedBandText =
              document.getElementById("selected-band-text");
            const selectedGenreText = document.getElementById(
              "selected-genre-text"
            );
            selectedGenreText.textContent = "Genre: " + genre.id;
            selectedGenre = genre;
            selectedBand = null;
            selectedBandText.textContent = "Band";

            //highlight bands of selected genre
            if (selectedBand === null) {
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
            }
          }

          d3.selectAll(".genre-group").attr("opacity", (d) => {
            if (selectedGenre && d.id === selectedGenre.id) {
              return 1.0; //highlight selected band
            } else if (selectedGenre) {
              return 0.2; //highlight bands of selected genre
            }
          });
        });
    }

    //reset button functionality
    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
      selectedBand = null;
      selectedGenre = null;

      document.getElementById("selected-band-text").textContent = "Band";
      document.getElementById("selected-genre-text").textContent = "Genre";

      //reset opacities
      d3.selectAll(".band-group").attr("opacity", 0.7);
      d3.selectAll(".genre-group").attr("opacity", 1.0);
    });

    //use d3.timer to create a continuous animation
    const info = {
      bandNodes: bandNodes,
      bandCircles: bandCircles,
      genreData: this.genreData,
    };
    d3.timer((elapsed) => updateSimulation(info, elapsed, this.travelSpeed));
  }

  update(newData) {
    //update logic
  }

  destroy() {
    //clean after switching views
    d3.select(this.container).selectAll("*").remove();
  }
}
