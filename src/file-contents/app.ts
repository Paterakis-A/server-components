export const appContent = `
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
    path: path.resolve(__dirname, "../.env."+process.env.NODE_ENV),
});
// import * as Sentry from '@sentry/node';
import AppDataSource from './app-data-source';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routingService from './services/routing';
import { createServer } from 'http';
import { createStream } from 'rotating-file-stream';
import {
    errorLogger,
    infoLogger,
    unhandledErrorLogger,
} from './services/logger';
import userService from './services/user';
import jwtService from './services/jwt';
import { Server } from 'socket.io';

AppDataSource.initialize().then(async () => {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    jwtService.checkKeys();

    await userService.initializeAdmin();

    if (!isDevelopment) {
        // Sentry.init({
        //     dsn: 'https://98364e9a2ad61312b88c8d766c35a058@o4508110298284032.ingest.de.sentry.io/4508134592217168',
        // });
    } else {
        console.log('Server is running in development mode.');
    }

    const accessLogStream = createStream('access.log', {
        compress: 'gzip',
        interval: '1d',
        path: path.join(__dirname, "../logs/"+process.env.NODE_ENV),
    });

    const app = express();

    app.use(morgan('combined', { stream: accessLogStream }));

    app.use(helmet());

    const limiter = rateLimit({
        legacyHeaders: false,
        limit: 150,
        message:
            'Too many requests from this IP, please try again after 1 minute',
        standardHeaders: true,
        windowMs: 60 * 1000,
    });

    app.use(limiter);

    app.use(
        express.json({
            limit: '5mb',
        }),
    );

    app.use(
        express.urlencoded({
            extended: true,
            limit: '5mb',
        }),
    );

    const server = createServer(app);

    server.listen(process.env.PORT, () => {
        infoLogger.info(
            "Server is listening in port " + process.env.PORT + " and environment " + process.env.NODE_ENV + ".",
        );
    });

    const io = new Server(server, {
        cors: {
            origin: JSON.parse(process.env.CORS_ALLOWED_WEB!),
        },
    });
    app.set('socket', io);

    io.on('connection', (socket) => {
        socket.on('join ticket', (ticketID: string) => {
            socket.join(ticketID);
        });
    });

    app.use(
        cors({
            allowedHeaders: ['Authorization', 'Content-Type', 'X-TFA'],
            methods: ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'],
            origin: JSON.parse(process.env.CORS_ALLOWED_WEB!),
        }),
    );

    app.use(routingService);

    app.use(
        (
            error: any,
            request: Request,
            response: Response,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            next: NextFunction,
        ): any => {
            errorLogger.error(error.message);
            if (isDevelopment) {
                console.log(error);
            } else {
                // Sentry.captureException(error);
            }
            if (error.sqlState) {
                return response.status(400).send('Error at database.');
            } else {
                return response.status(406).send('Error at process.');
            }
        },
    );

    app.use((request: Request, response: Response): any => {
        unhandledErrorLogger.error('Not found.');
        return response.status(404).send('Not found.');
    });
});

`;
