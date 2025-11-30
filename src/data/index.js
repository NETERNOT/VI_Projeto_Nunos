import { loadCsvData } from "./dataLoader.js";
import { extractGenres } from "./extractGenres.js";

export const rawDataPromise =  loadCsvData();
export const genresListPromise = rawDataPromise.then(raw => extractGenres(raw));
