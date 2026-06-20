import { createApp } from "./app.js";
import { config } from "./config/env.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`babe_get_this_apis listening on http://localhost:${config.port}`);
});
