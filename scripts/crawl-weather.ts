import { runWeatherCrawler } from "../src/lib/weather";

const days = Number(process.argv[2] ?? 7);

runWeatherCrawler(days)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
