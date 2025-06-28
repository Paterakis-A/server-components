import dotenv from "dotenv";
import { startWebServer } from "../web/app";
dotenv.config();

export const startApiServer = (args: string[]) => {
  startWebServer(args);
};
