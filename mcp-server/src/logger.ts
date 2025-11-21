import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

export const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'mcp-orchestration-server' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            dirname: 'logs'
        }),
        new winston.transports.File({
            filename: 'combined.log',
            dirname: 'logs'
        }),
    ],
});
