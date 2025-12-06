function renderGenreTimeline(genres, bands, options){
    const {
    containerSelector = "#timelineContainer",
    maxFans = 50000,
    width = 900,
    height = 300,
    margin = { top: 20, right: 20, bottom: 30, left: 60 },
  } = options;

  // código de d3
}

function genreArea(genres, bands) {
  //genre must be the id. bands is bandNode data array, or a filtered version of it
  const earliest = 1964;
  const present = 2017;

  bands = bands.map((band) => {
    band.split = band.split === "-" ? "2017" : band.split;
  });

  let listOfData = [];
  for (let genre of genres) {
    bands = bands.filter((band) => {
      return band.style.includes(genre);
    });

    let thisYearData = [];
    for (let year = earliest; year <= present; year++) {
      thisYearData.push({
        year: year,
        fans: bands
          .filter((band) => band.formed <= year && band.split >= year)
          .reduce((sum, band) => {
            return sum + band.fans;
          }, 0),
      });
    }
    listOfData.push(thisYearData)
  }

  let areaPaths = [];
  for(let genreData of listOfData){
    //d3 code for area for each genre
        //(this may be a function called for each genreData)
    //append each area to areaPaths
  }

  //return the area paths for each genre
}
