import express, { Request, Response } from "express";
import GitHubService from "./services/github";

import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.get("/", async (req: Request, res: Response) => {
  const token = process.env.TOKEN as string;
  const owner = process.env.OWNER as string;
  const targetRepo = process.env.TARGET_REPO as string;
  const service = new GitHubService(token, owner);

  const newInitPath = "C:/Users/Admin/Desktop/dev/easy-api/test";

  // service.createBranch("authorization-middleware", targetRepo, "main");
  service.initializeBranch(
    targetRepo,
    "authorization-middleware_test",
    newInitPath,
    "main"
  );

  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`Server started on port ${port}`);
});
