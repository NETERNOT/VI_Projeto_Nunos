export class HomeView {
  constructor(container, data) {
    this.container = container;
    this.data = data;

    this.zoomScale = 1; //initial zoom scale
    this.minZoom = 0.5;
    this.maxZoom = 3;
    this.zoomStep = 0.2;

    //canvas dimensions for overflow area
    this.canvasWidth = this.container.offsetWidth;
    this.canvasHeight = this.container.offsetHeight;
  }

  render() {
    //D3 rendering

    //setup zoom event listeners
    this.setupZoomControls();

    const Genres = this.data.reduce((list, el) => {
      el.style.forEach((genre) => {
        if (!list.hasOwnProperty(genre)) {
          list[genre] = { total: el.fans };
        } else {
          list[genre].total += el.fans;
        }
      });
      return list;
    }, {});

    for (let band of this.data) {
      for (let genre of band.style) {
        if (!Genres[genre].hasOwnProperty(band.origin)) {
          Genres[genre][band.origin] = 0;
        }
        Genres[genre][band.origin] += band.fans;
      }
    }

    //create container with overflow scrolling
    const scrollContainer = d3
      .select(this.container)
      .style("overflow", "auto")
      .style("width", "100%")
      .style("height", "100vh");

    //create main container with larger canvas
    const mainSvg = scrollContainer
      .append("svg")
      .attr("width", this.canvasWidth)
      .attr("height", this.canvasHeight)
      .style("background-color", "#232324");

    //create zoomable group
    this.zoomGroup = mainSvg.append("g").attr("class", "zoom-group");

    console.log(Genres);

    //array to store positioned circles for collision detection
    const positionedCircles = [];

    Object.entries(Genres).forEach(([genre, fans]) => {
      const scaleFactor = 0.2;
      const fansRadius = Math.max(20, Math.sqrt(fans.total * scaleFactor));

      //find a non-overlapping position
      let position = this.findNonOverlappingPosition(
        positionedCircles,
        fansRadius
      );

      //store this circle's position for future collision checks
      positionedCircles.push({
        x: position.x,
        y: position.y,
        radius: fansRadius + 10, //add 10px padding
      });

      const svg = this.zoomGroup
        .append("g")
        .attr("class", "genre-group")
        .attr("transform", `translate(${position.x}, ${position.y})`);

      const circle = svg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", fansRadius)
        .attr("fill", "#ccc")
        .style("cursor", "pointer")
        .on("click", function () {
          const currentFill = d3.select(this).attr("fill");
          const newFill = currentFill === "#ccc" ? "#f00" : "#ccc";
          d3.select(this).attr("fill", newFill);
        });

      svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", Math.max(8, fansRadius / 4))
        .attr("fill", "#000")
        .attr("pointer-events", "none")
        .text(genre);
    });

    //apply initial zoom
    this.applyZoom();
    //D3 rendering view specific
  }

  //function to find a position that doesn't overlap with existing circles
  findNonOverlappingPosition(existingCircles, radius) {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      //generate random position within larger canvas bounds, keeping circles fully inside
      const x = radius + Math.random() * (this.canvasWidth * 2.4);
      const y = radius + Math.random() * (this.canvasHeight * 2.4);

      //check if this position overlaps with any existing circle
      let overlaps = false;
      for (let existing of existingCircles) {
        const distance = Math.sqrt(
          Math.pow(x - existing.x, 2) + Math.pow(y - existing.y, 2)
        );

        if (distance < radius + existing.radius) {
          overlaps = true;
          break;
        }
      }

      //if no overlap found, return this position
      if (!overlaps) {
        return { x, y };
      }

      attempts++;
    }

    //if we couldn't find a non-overlapping position after max attempts,
    //use a grid-based fallback
    const gridSize = Math.ceil(Math.sqrt(existingCircles.length + 1));
    const cellWidth = this.canvasWidth / gridSize;
    const cellHeight = this.canvasHeight / gridSize;
    const row = Math.floor(existingCircles.length / gridSize);
    const col = existingCircles.length % gridSize;

    return {
      x: col * cellWidth + cellWidth / 2,
      y: row * cellHeight + cellHeight / 2,
    };
  }

  update(newData) {
    //update logic
  }

  //setup zoom button event listeners
  setupZoomControls() {
    //remove existing listeners to prevent duplicates
    this.removeZoomListeners();

    //bind methods to preserve 'this' context
    this.zoomInHandler = () => this.zoomIn();
    this.zoomOutHandler = () => this.zoomOut();
    this.zoomResetHandler = () => this.zoomReset();

    //add event listeners
    document
      .getElementById("zoom-in")
      ?.addEventListener("click", this.zoomInHandler);
    document
      .getElementById("zoom-out")
      ?.addEventListener("click", this.zoomOutHandler);
    document
      .getElementById("zoom-reset")
      ?.addEventListener("click", this.zoomResetHandler);
  }

  //remove zoom event listeners
  removeZoomListeners() {
    document
      .getElementById("zoom-in")
      ?.removeEventListener("click", this.zoomInHandler);
    document
      .getElementById("zoom-out")
      ?.removeEventListener("click", this.zoomOutHandler);
    document
      .getElementById("zoom-reset")
      ?.removeEventListener("click", this.zoomResetHandler);
  }

  //zoom in function
  zoomIn() {
    if (this.zoomScale < this.maxZoom) {
      this.zoomScale += this.zoomStep;
      this.applyZoom();
    }
  }

  //zoom out function
  zoomOut() {
    if (this.zoomScale > this.minZoom) {
      this.zoomScale -= this.zoomStep;
      this.applyZoom();
    }
  }

  //reset zoom function
  zoomReset() {
    this.zoomScale = 1;
    //also reset scroll position
    d3.select(this.container)
      .property("scrollTop", 0)
      .property("scrollLeft", 0);
    this.applyZoom();
  }

  //apply zoom transformation
  applyZoom() {
    if (this.zoomGroup) {
      this.zoomGroup
        .transition()
        .duration(300)
        .attr("transform-origin", "center")
        .attr("transform", `scale(${this.zoomScale})`);
    }
  }

  destroy() {
    //clean after switching views
    this.removeZoomListeners(); //clean up event listeners
    d3.select(this.container).selectAll("*").remove();
  }
}
