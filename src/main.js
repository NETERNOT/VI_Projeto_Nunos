import { HomeView } from "./views/home_view.js";
import { BandView } from "./views/band_view.js";
import { GenreView } from "./views/genre_view.js";
import { rawDataPromise, genresListPromise } from "./data/index.js";

document.getElementById("back-arrow").addEventListener(("click"), ()=>{
  document.body.classList.toggle("aside-open")
});

class ViewController {
  constructor() {
    //initialize variables as null to get the content later
    this.currentView = null;
    this.rawData = null;
    this.genreData = null;
    this.container = null;
  }

  //function to get the container for the view
  init() {
    this.container = document.getElementById("main-container");
    if (!this.container) {
      console.error("main-container element not found");
      return false;
    }
    return true;
  }

  //function to load the csv data and log if it catches it
  async loadData() {
    //load data CSV
    this.rawData = await rawDataPromise;
    console.log("Raw Data loaded:", this.rawData.length, "records");

    this.genreData = await genresListPromise;
    console.log("Genre Data loaded:", Object.keys(this.genreData).length, "genres");
  }

  //function to render and switch between views
  showView(viewName) {
    //destroy current view
    if (this.currentView) {
      this.currentView.destroy();
    }

    //create new view
    switch (viewName) {
      case "home_view":
        this.currentView = new HomeView(this.container, this.rawData, this.genreData);
        break;
      case "band_view":
        this.currentView = new BandView(this.container, this.rawData);
        break;
      case "genre_view":
        this.currentView = new GenreView(this.container, this.rawData);
        break;
    }

    if (this.currentView) {
      this.currentView.render(); //render the current view
      console.log("View rendered:", viewName);
    } else {
      console.error("Failed to create view:", viewName);
    }
  }
}

const viewController = new ViewController(); //initialize the view controller as a variable

//wait for DOM to be ready
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing...");

  //if there is no container, log error
  if (!viewController.init()) {
    console.error("Failed to initialize view controller");
    return;
  }

  //await the data and show the view, if there is no data, log error
  try {
    await viewController.loadData();
    viewController.showView("home_view");
  } catch (error) {
    console.error("Error loading data:", error);
  }
});

window.viewController = viewController;
