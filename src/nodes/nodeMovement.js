export function updateSimulation(info, elapsed){
    const {
        bandNodes = [],
        bandCircles = d3.selectAll('.band-node'),
        genreData = []
    } = info;
    
  for (let band of bandNodes) {
    const genre = band.style[band.currentGenreIndex]; //take first genre for simplicity
    const genreNode = genreData.find((n) => n.id === genre); //find genre node

    if (
      genreNode &&
      typeof genreNode.x === "number" &&
      typeof genreNode.y === "number"
    ) {
      //calculate orbital position around genre and update position based on orbital mechanics

      if (band.state === "orbiting") {
        const fullRotation = 2 * Math.PI; //full circle in radians

        //if it completes a full orbit, increment orbitsCompleted
        if (band.orbitalAngle >= fullRotation) {
          band.orbitalAngle = band.orbitalAngle % fullRotation;
          band.orbitsCompleted += 1;

          //if reached target orbits, switch to traveling state
          if (band.orbitsCompleted >= band.targetOrbits) {
            band.state = "traveling";
            band.transitionProgress = 0; //reset transition progress
            band.orbitsCompleted = 0; //reset orbits completed
          }
        }
        //calculate new position in orbit
        band.x = genreNode.x + Math.cos(band.orbitalAngle) * band.orbitalRadius;
        band.y = genreNode.y + Math.sin(band.orbitalAngle) * band.orbitalRadius;
        band.orbitalAngle += band.angularVelocity;
      } else if (band.state === "traveling") {
        //linear interpolation to next genre
        const nextGenre =
          band.style[(band.currentGenreIndex + 1) % band.style.length];
        const nextGenreNode = genreData.find((n) => n.id === nextGenre);
        if (nextGenreNode) {
          //store starting position for smooth interpolation
          if (!band.startX) {
            band.startX = band.x;
            band.startY = band.y;
          }

          band.transitionProgress += 0.0025; //increased speed for smoother transition

          //smooth easing function for natural movement
          const easeProgress =
            band.transitionProgress *
            band.transitionProgress *
            (3 - 2 * band.transitionProgress);

          //smooth interpolation from start to target
          band.x = band.startX + (nextGenreNode.x - band.startX) * easeProgress;
          band.y = band.startY + (nextGenreNode.y - band.startY) * easeProgress;

          //check distance for arrival
          const distance = Math.sqrt(
            (band.x - nextGenreNode.x) ** 2 + (band.y - nextGenreNode.y) ** 2
          );

          //if arrived, switch to orbiting state
          if (
            band.transitionProgress >= 1 ||
            distance < nextGenreNode.radius + 10
          ) {
            band.state = "orbiting";
            //fix arrival angle calculation
            const arrivalAngle = Math.atan2(
              band.y - nextGenreNode.y,
              band.x - nextGenreNode.x
            );
            //reset orbital parameters for new genre
            band.orbitalAngle = arrivalAngle;
            band.orbitalRadius = nextGenreNode.radius + 5;
            band.targetGenre = nextGenre;
            band.transitionProgress = 0;
            band.orbitsCompleted = 0;
            band.currentGenreIndex =
              (band.currentGenreIndex + 1) % band.style.length;
            //clear starting position
            band.startX = undefined;
            band.startY = undefined;
          }
        }
      }

      //update
      bandCircles
        .filter((d) => d.id === band.id)
        .attr("transform", `translate(${band.x}, ${band.y})`);
    } else {
      //if no genre found or positions not ready, keep current position
      // Don't move until genre positions are available
    }
  }
}
