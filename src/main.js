import { HomeView } from "./views/home_view.js";
import { BandView } from "./views/band_view.js";
import { GenreView } from "./views/genre_view.js";

class ViewController {
  constructor() {
    this.currentView = null;
    this.data = null;
    this.container = "#main-container";
  }

  async loadData() {
    //load data CSV
    this.data = await d3.csv("./public/db/metal_bands_2017_v2.csv");
  }

  showView(viewName) {
    //destroy current view
    if (this.currentView) {
      this.currentView.destroy();
    }

    //create new view
    switch (viewName) {
      case "home_view":
        this.currentView = new HomeView(this.container, this.data);
        break;
      case "band_view":
        this.currentView = new BandView(this.container, this.data);
        break;
      case "genre_view":
        this.currentView = new GenreView(this.container, this.data);
        break;
    }

    this.currentView.render(); //render the current view
  }
}

const viewController = new ViewController();
viewController.loadData().then(() => {
  viewController.showView("home_view"); //show default view
});

window.viewController = viewController;
