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

        let countryEntry = entry.fans.countries.find(
          (e) => e.country === band.origin
        );

        if (countryEntry) {
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

  const withRadius = genreNodeData.map((genre) => ({
      ...genre,
      radius: Math.max(12.5, Math.sqrt(genre.fans.total * 0.2)),
  }));

  let dataCopy = data.map((band) => ({
    ...band,
    split: band.split === "-" ? "2017" : band.split,
  }));

  const minDate = Math.min(...dataCopy.map((band) => parseInt(band.formed)));
  const maxDate = Math.max(...dataCopy.map((band) => parseInt(band.split)));

  const withFansByYear = withRadius.map((genre) => {
    let fansByYear = [];
    for (let year = minDate; year < maxDate; year++) {
      let bandsInYear = dataCopy.filter(
        (band) => band.formed <= year && year <= band.split
      );

      bandsInYear = bandsInYear.filter((band)=>{
        return band.style.includes(genre.id)
      })

      let fansInYear = bandsInYear.reduce((sum, band) => {
        return sum + band.fans;
      }, 0);

      fansByYear.push({
        year,
        fans: fansInYear,
      });
    }

    return {
      ...genre,
      fansByYear,
    };
  });
  
  console.log("genreData:", withFansByYear)
  return withFansByYear;
}
