export const loggerServiceContent = `
import { createLogger, format, transports } from 'winston';

export const errorLogger = createLogger({
    level: 'error',
    transports: [
        new transports.File({
            filename: "./logs/"+ process.env.NODE_ENV +"/error.log",
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(
                    (info) =>
                        info.level + ":" + [info.timestamp] + ": " + info.message,
                ),
            ),
            level: 'error',
        }),
    ],
});

export const infoLogger = createLogger({
    level: 'info',
    transports: [
        new transports.File({
            filename: "./logs/"+ process.env.NODE_ENV +"/info.log",
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(
                    (info) =>
                        info.level + ":" + [info.timestamp] + ": " + info.message,
                ),
            ),
            level: 'info',
        }),
    ],
});

export const unhandledErrorLogger = createLogger({
    level: 'error',
    transports: [
        new transports.File({
            filename: "./logs/"+ process.env.NODE_ENV +"/unhandled-error.log",
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(
                    (info) =>
                        info.level + ":" + [info.timestamp] + ": " + info.message,
                ),
            ),
            level: 'error',
        }),
    ],
});

export default { errorLogger, infoLogger, unhandledErrorLogger };
`;
