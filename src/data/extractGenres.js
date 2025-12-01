export function extractGenres(data) {
  const genreNodeData = data.reduce((list, band) => {
    band.style.forEach((style) => {
      if (!list.some((e) => e.id === style)) {
        list.push({
          id: style,
          fans: { total: band.fans, 
                  [band.origin]: band.fans 
                },
        });
      } else {
        let entry = list.find((e) => e.id === style);
        entry.fans.total += band.fans;
        entry.fans[band.origin] += band.fans;
      }
    });
    return list;
  }, []);

  const withRadius = genreNodeData.map((genre)=>{
    return {
      ...genre,
      radius: Math.max(12.5, Math.sqrt(genre.fans.total * 0.2)),
    };
  })

  return withRadius;
}
