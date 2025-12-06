export function extractGenres(data) {
  const genreNodeData = data.reduce((list, band) => {
    band.style.forEach((style) => {
      if (!list.some((e) => e.id === style)) {
        list.push({
          id: style,
          fans: {
            total: band.fans,
            countries: [
              {
                country: band.origin,
                fans: band.fans,
              },
            ],
          },
        });
      } else {
        let entry = list.find((e) => e.id === style);
        entry.fans.total += band.fans;

        let countryEntry = entry.fans.countries.find((e)=> e.country === band.origin)

        if(countryEntry){
          countryEntry.fans += band.fans;
        } else {
          entry.fans.countries.push({
            country: band.origin,
            fans: band.fans,
          });
        }
        
      }
    });
    return list;
  }, []);

  const withRadius = genreNodeData.map((genre) => {
    return {
      ...genre,
      radius: Math.max(12.5, Math.sqrt(genre.fans.total * 0.2)),
    };
  });

  return withRadius;
}
