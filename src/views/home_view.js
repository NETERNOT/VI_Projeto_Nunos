import { createNodes } from "../nodes/createNodes.js";

export class HomeView {
  constructor(container, rawData, genreData) {
    this.container = container;
    this.rawData = rawData;
    this.genreData = genreData

    this.zoomScale = 1; //initial zoom scale
    this.minZoom = 0.2;
    this.maxZoom = 4;
    this.zoomStep = 0.2;

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
    const simulation = d3
      .forceSimulation(this.genreData)
      .force("charge", d3.forceManyBody().strength(-8))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.radius + 5)
      )
      .force(
        "center",
        d3.forceCenter(this.canvasWidth / 2, this.canvasHeight / 2)
      );

    //update positions on each tick
    simulation.on("tick", () => {
      circles.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    //USAR O X E O Y DOS circles PARA O ALGORITMO DAS BANDAS ANDAR ENTRE ELES
    //BANDS RENDER HERE
    // ------------------------------------------------------

    //list of bands with their details
    const Bands = this.rawData.reduce((list, el) => {
      if (!list.hasOwnProperty(el.band_name)) {
        list[el.band_name] = {
          band_name: el.band_name,
          origin: el.origin,
          split: el.split,
          style: el.style,
          fans: el.fans,
        };
      }
      return list;
    }, {});

    console.log(Bands); //log the bands for debug

    //create band nodes with orbital mechanics
    const bandNodes = Object.values(Bands).map((band) => ({
      id: band.band_name,
      band_name: band.band_name,
      origin: band.origin,
      fans: band.fans,
      radius: Math.max(1, Math.sqrt(band.fans * 0.01)),
      style: band.style,
      x: Math.random() * this.canvasWidth,
      y: Math.random() * this.canvasHeight,
      orbitalAngle: Math.random() * Math.PI * 2,
      angularVelocity: 0.01 + Math.random() * 0.02,
      currentGenreIndex: 0,
      orbitsCompleted: 0,
      targetOrbits: 4,
      orbitalRadius: this.genreData.find((n) => n.id === band.style[0])
        ? this.genreData.find((n) => n.id === band.style[0]).radius + 5
        : 100,
      state: "orbiting",
      targetGenre: band.style[0],
      transitionProgress: 0,
    }));

    //create band circles
    const bandCircles = createNodes(bandNodes, this.zoomGroup, "band")

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

          d3.selectAll(".band-group").attr("opacity", (d) => {
            if (selectedBand && d.id === selectedBand.id) {
              return 1.0; //highlight selected band
            } else if (selectedBand) {
              return 0.2; //dim other bands
            }
          });
        });
    }

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
    d3.timer(function (elapsed) {
      for (let i = 0; i < bandNodes.length; i++) {
        const band = bandNodes[i]; //get each band
        const genre = band.style[band.currentGenreIndex]; //take first genre for simplicity
        const genreNode = self.genreData.find((n) => n.id === genre); //find genre node

        if (
          genreNode &&
          typeof genreNode.x === "number" &&
          typeof genreNode.y === "number"
        ) {
          //calculate orbital position around genre and update position based on orbital mechanics

          if (band.state === "orbiting") {
            const fullRotation = 2 * Math.PI; //full circle in radians

            //if it completes a full orbit, increment orbitsCompleted
            if (band.orbitalAngle >= fullRotation) {
              band.orbitalAngle = band.orbitalAngle % fullRotation;
              band.orbitsCompleted += 1;

              //if reached target orbits, switch to traveling state
              if (band.orbitsCompleted >= band.targetOrbits) {
                band.state = "traveling";
                band.transitionProgress = 0; //reset transition progress
                band.orbitsCompleted = 0; //reset orbits completed
              }
            }
            //calculate new position in orbit
            band.x =
              genreNode.x + Math.cos(band.orbitalAngle) * band.orbitalRadius;
            band.y =
              genreNode.y + Math.sin(band.orbitalAngle) * band.orbitalRadius;
            band.orbitalAngle += band.angularVelocity;
          } else if (band.state === "traveling") {
            //linear interpolation to next genre
            const nextGenre =
              band.style[(band.currentGenreIndex + 1) % band.style.length];
            const nextGenreNode = self.genreData.find((n) => n.id === nextGenre);
            if (nextGenreNode) {
              //store starting position for smooth interpolation
              if (!band.startX) {
                band.startX = band.x;
                band.startY = band.y;
              }

              band.transitionProgress += 0.0025; //increased speed for smoother transition

              //smooth easing function for natural movement
              const easeProgress =
                band.transitionProgress *
                band.transitionProgress *
                (3 - 2 * band.transitionProgress);

              //smooth interpolation from start to target
              band.x =
                band.startX + (nextGenreNode.x - band.startX) * easeProgress;
              band.y =
                band.startY + (nextGenreNode.y - band.startY) * easeProgress;

              //check distance for arrival
              const distance = Math.sqrt(
                (band.x - nextGenreNode.x) ** 2 +
                  (band.y - nextGenreNode.y) ** 2
              );

              //if arrived, switch to orbiting state
              if (
                band.transitionProgress >= 1 ||
                distance < nextGenreNode.radius + 10
              ) {
                band.state = "orbiting";
                //fix arrival angle calculation
                const arrivalAngle = Math.atan2(
                  band.y - nextGenreNode.y,
                  band.x - nextGenreNode.x
                );
                //reset orbital parameters for new genre
                band.orbitalAngle = arrivalAngle;
                band.orbitalRadius = nextGenreNode.radius + 5;
                band.targetGenre = nextGenre;
                band.transitionProgress = 0;
                band.orbitsCompleted = 0;
                band.currentGenreIndex =
                  (band.currentGenreIndex + 1) % band.style.length;
                //clear starting position
                band.startX = undefined;
                band.startY = undefined;
              }
            }
          }

          //update
          bandCircles
            .filter((d) => d.id === band.id)
            .attr("transform", `translate(${band.x}, ${band.y})`);
        } else {
          //if no genre found or positions not ready, keep current position
          // Don't move until genre positions are available
        }
      }
    });
  }

  update(newData) {
    //update logic
  }

  destroy() {
    //clean after switching views
    d3.select(this.container).selectAll("*").remove();
  }
}
