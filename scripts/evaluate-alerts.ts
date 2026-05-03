import { evaluateUserAlerts } from "../src/lib/alerts";

const days = Number(process.argv[2] ?? 7);

evaluateUserAlerts(days)
  .then((sent) => {
    console.log(JSON.stringify({ sent }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
