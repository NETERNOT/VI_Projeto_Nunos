export function extractGenres(data) {
  return data.reduce((list, band) => {
    band.style.forEach((style) => {
      if (!list.hasOwnProperty(style)) {
        list[style] = { total: band.fans };
        list[style][band.origin] = band.fans;
      } else {
        list[style].total += band.fans ;
        list[style][band.origin] += band.fans;
      }
    });
    return list;
  }, {});
}