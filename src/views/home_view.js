export class HomeView {
  constructor(container, data) {
    this.container = container;
    this.data = data;
  }

  render() {
    //D3 rendering
    
    const Genres = this.data.reduce((list, el) => {
      el.style.forEach((genre) => {
        if (!list.hasOwnProperty(genre)) {
          list[genre] = el.fans;
        } else{
          list[genre] += el.fans;
        }
      });
      return list;
    }, {} );


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
