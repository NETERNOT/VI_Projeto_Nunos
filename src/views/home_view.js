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
    }, [] );
    console.log(Genres);

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
