export async function getSearchResults(bands, genres, input) {
  const lowerInput = input.toLowerCase();

  const bandResults = bands.filter((band) => {
    const bandName = band.id || band.band_name || "";
    return bandName.toLowerCase().includes(lowerInput);
  });

  const genreResults = genres.filter((genre) => {
    const genreId = genre.id || "";
    return genreId.toLowerCase().includes(lowerInput);
  });

  return {
    bands: bandResults,
    genres: genreResults,
  };
}
