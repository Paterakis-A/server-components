import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";

export const startWebServer = (args: string[]) => {
  const app = express();
  app.use(helmet());

  const limiter = rateLimit({
    legacyHeaders: false,
    limit: 150,
    message: "Too many requests from this IP, please try again after 1 minute",
    standardHeaders: true,
    windowMs: 60 * 1000,
  });

  app.use(limiter);

  app.use(
    express.urlencoded({
      extended: true,
      limit: "5mb",
    }),
  );

  const server = createServer(app);

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server is listening in port ${port}.`);
    // infoLogger.info(
    //   `Server is listening in port ${process.env.PORT} and environment ${process.env.NODE_ENV}.`,
    // );
  });

  app.use(
    cors({
      allowedHeaders: ["Authorization", "Content-Type", "X-TFA"],
      methods: ["DELETE", "GET", "PATCH", "POST", "PUT"],
      //   origin: JSON.parse(process.env.CORS_ALLOWED_WEB!),
    }),
  );

  app.use(
    (
      error: any,
      request: Request,
      response: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: NextFunction,
    ): any => {
      //   errorLogger.error(error.message);
      //   if (isDevelopment) {
      //     console.log(error);
      //   } else {
      //     // Sentry.captureException(error);
      //   }
      //   if (error.sqlState) {
      //     return response.status(400).send("Error at database.");
      //   } else {
      //     return response.status(406).send("Error at process.");
      //   }
    },
  );

  app.use((request: Request, response: Response): any => {
    // unhandledErrorLogger.error("Not found.");
    return response.status(404).send("Not found.");
  });
};
