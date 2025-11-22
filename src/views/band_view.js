export class BandView {
  constructor(container, data) {
    this.container = container;
    this.data = data;
  }

  render() {
    //D3 rendering
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
