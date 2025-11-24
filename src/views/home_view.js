export class HomeView {
  constructor(container, data) {
    this.container = container;
    this.data = data;
  }

  render() {
    //D3 rendering
    console.log("Ta a receber esta data", this.data);
    const Genres = this.data.reduce((list, el) => {
      el.style.forEach((genre) => {
        if (!list.includes(genre)) {
          list.push(genre);
        }
      });
      return list;
    }, []);
    console.log(Genres);
    Genres.forEach((genre) => {
      const svg = d3
        .select(this.container)
        .append("svg")
        .attr("width", 200)
        .attr("height", 200)
        .attr("fill", "#ccc");

      svg.append("circle").attr("cx", 100).attr("cy", 120).attr("r", 60);

      // Add text above the circle
      svg
        .append("text")
        .attr("x", 100)
        .attr("y", 125) // Positioned above the circle
        .attr("text-anchor", "middle")
        .attr("font-size", "12pt")
        .attr("fill", "#000")
        .text(genre);
    });
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
