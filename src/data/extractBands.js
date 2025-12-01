/* const Bands = this.rawData.reduce((list, el) => {
  if (!list.hasOwnProperty(el.band_name)) {
    list[el.band_name] = {
      band_name: el.band_name,
      origin: el.origin,
      split: el.split,
      style: el.style,
      fans: el.fans,
    };
  }
  return list;
}, {});

const bandNodes = Object.values(Bands).map((band) => ({
  id: band.band_name,
  band_name: band.band_name,
  origin: band.origin,
  fans: band.fans,
  radius: Math.max(1, Math.sqrt(band.fans * 0.01)),
  style: band.style,
  x: Math.random() * this.canvasWidth,
  y: Math.random() * this.canvasHeight,
  orbitalAngle: Math.random() * Math.PI * 2,
  angularVelocity: 0.01 + Math.random() * 0.003,
  currentGenreIndex: 0,
  orbitsCompleted: 0,
  targetOrbits: 4,
  orbitalRadius: this.genreData.find((n) => n.id === band.style[0])
    ? this.genreData.find((n) => n.id === band.style[0]).radius + 5
    : 100,
  state: "orbiting",
  targetGenre: band.style[0],
  transitionProgress: 0,
})); */

export function extractBands(data, options = {}) {
  const {
    canvasWidth = window.innerWidth,
    canvasHeight = window.innerHeight,
    genreData = [],
  } = options;
  const bandNodeData = data.reduce((list, band) => {
    list.push({
      id: band.band_name,
      band_name: band.band_name,
      origin: band.origin,
      fans: band.fans,
      radius: Math.max(1, Math.sqrt(band.fans * 0.01)),
      style: band.style,
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      orbitalAngle: Math.random() * Math.PI * 2,
      angularVelocity: 0.01 + Math.random() * 0.003,
      currentGenreIndex: 0,
      orbitsCompleted: 0,
      targetOrbits: 4,
      orbitalRadius: genreData.find((n) => n.id === band.style[0])
        ? genreData.find((n) => n.id === band.style[0]).radius + 5
        : 100,
      state: "orbiting",
      targetGenre: band.style[0],
      transitionProgress: 0,
    });

    return list;
  }, []);

  return bandNodeData;
}
