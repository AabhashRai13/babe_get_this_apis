import { createApp } from "./app.js";
import { config } from "./config/env.js";

const app = createApp();

app.listen(config.port, () => {
  const time = new Date().toLocaleTimeString();
  console.log(
    `🔄 [${time}] reloaded (${config.env}) — http://localhost:${config.port}`,
  );
});
