import { demoSpots, generateDemoForecast } from "../src/lib/demo-data";
import { rateSpotForDate } from "../src/lib/scoring";

const date = new Date();
date.setDate(date.getDate() + 1);
date.setHours(0, 0, 0, 0);

const ratings = demoSpots
  .map((spot) => rateSpotForDate(spot, generateDemoForecast(spot, date, 1), date, { avoidOffshoreWind: true }))
  .filter((rating): rating is NonNullable<typeof rating> => Boolean(rating))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

for (const rating of ratings) {
  console.log(rating.explanation);
}
