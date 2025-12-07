export async function getBandInfo(bandName) {
  try {
    const response = await fetch(`https://www.theaudiodb.com/api/v1/json/123/search.php?s=${encodeURIComponent(bandName)}`);
    let data = await response.json();
    data = data.artists[0]
    //console.log("API response:", data);

    return data
  } catch (error) {
    console.error("Error:", error);
  }
}
