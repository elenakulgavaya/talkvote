import { createApp } from "./app.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const app = createApp();

app.listen(PORT, () => {
  console.log(`TalkVote backend running on http://localhost:${PORT}`);
});
