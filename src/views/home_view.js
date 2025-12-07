import { createNodes } from "../nodes/createNodes.js";
import { extractBands } from "../data/extractBands.js";
import { extractGenres } from "../data/extractGenres.js";
import { forceSimulation } from "../nodes/forceSimulation.js";
import { updateSimulation } from "../nodes/nodeMovement.js";
import { handleClick } from "../nodes/handleClick.js";
import { handleHover } from "../nodes/handleHover.js";
import { getImages } from "../data/getImages.js";
import { getSearchResults } from "../data/searchResults.js";
import { getBandInfo } from "../data/getBandInfo.js";
import { updateFanSpread } from "../nodes/handleClick.js";
import { bandInfoUpdate } from "../nodes/handleClick.js";
import { search } from "./panel.js";
import { settings } from "./panel.js";

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

    //BANDS RENDER HERE

    const bandNodes = extractBands(this.rawData, {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      genreData: this.genreData,
    });

    //create band circles
    const bandCircles = createNodes(
      bandNodes,
      this.zoomGroup,
      "band",
      getImages
    );

    //selected band and genre for interaction
    let selectedBand = null;
    let selectedGenre = null;

    //add click interaction to display selected band and genre
    handleClick(bandNodes, bandCircles, circles, this.genreData);
    handleHover(bandCircles);

    //reset button functionality
    const resetButton = document.getElementById("reset-button");
    resetButton.addEventListener("click", () => {
      selectedBand = null;
      selectedGenre = null;

      document.getElementById("selected-panel").style.display = "none";

      //  document.getElementById("selected-band-text").textContent = "Band";
      //  document.getElementById("selected-genre-text").textContent = "Genre";

      //reset opacities
      d3.selectAll(".band-group").attr("opacity", 0.7);
      d3.selectAll(".genre-group").attr("opacity", 1.0);

      document.querySelector("aside").classList.toggle("active", 0);
      document.querySelector(".spread-container").innerHTML = "";
    });

    //SEARCH FUNCTIONALITY
    const searchInput = document.getElementById("search-bar");
    const searchResults = document.getElementById("search-results");

    if (searchInput && searchResults) {
      search(
        bandNodes,
        this.genreData,
        searchInput,
        searchResults,
        getSearchResults,
        bandInfoUpdate,
        updateFanSpread
      );
    }

    //SETTINGS PANEL FUNCTIONALITY
    settings(0);

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
