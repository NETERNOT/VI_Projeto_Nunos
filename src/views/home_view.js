export class HomeView {
  constructor(container, data) {
    this.container = container;
    this.data = data;

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

    //list of genres with total fans and origin breakdown
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

    //list of origins per genre with fans
    for (let band of this.data) {
      for (let genre of band.style) {
        if (!Genres[genre].hasOwnProperty(band.origin)) {
          Genres[genre][band.origin] = 0;
        }
        Genres[genre][band.origin] += band.fans;
      }
    }

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
    }

    const zoom = d3
      .zoom()
      .scaleExtent([this.minZoom, this.maxZoom])
      .translateExtent([
        [-200, -200],
        [this.canvasWidth + 200, this.canvasHeight + 200],
      ])
      .on("zoom", zoomed);

    mainSvg.call(zoom);

    //store zoom behavior for button controls
    this.zoom = zoom;
    this.mainSvg = mainSvg;

    console.log(Genres);

    //convert Genres object to array for D3 simulation
    const nodes = Object.entries(Genres).map(([genre, fans]) => ({
      id: genre,
      genre: genre,
      fans: fans.total,
      radius: Math.max(14.5, Math.sqrt(fans.total * 0.145)),
    }));

    //create circles first
    const circles = this.zoomGroup
      .selectAll(".genre-group")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "genre-group");

    circles
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", "#ccc")
      .style("cursor", "pointer")
      .on("click", function () {
        const currentFill = d3.select(this).attr("fill");
        const newFill = currentFill === "#ccc" ? "#f00" : "#ccc";
        d3.select(this).attr("fill", newFill);
      });

    circles
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", (d) => d.radius / 6 + 1)
      .attr("fill", "#000")
      .attr("pointer-events", "none")
      .text((d) => d.genre);

    //set up force simulation
    const simulation = d3
      .forceSimulation(nodes)
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

    //D3 rendering view specific
  }

  update(newData) {
    //update logic
  }

  destroy() {
    //clean after switching views
    d3.select(this.container).selectAll("*").remove();
  }
}
