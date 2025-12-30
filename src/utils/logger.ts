import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, context }) => {
            const ctx = context ? `[${context}]` : '';
            return `${timestamp} ${level.toUpperCase().padEnd(7)} ${ctx} ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.colorize({ all: true })
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

export class Logger {
    constructor(private context: string) {}
    
    info(message: string, meta?: any) {
        logger.info(message, { context: this.context, ...meta });
    }
    
    warn(message: string, meta?: any) {
        logger.warn(message, { context: this.context, ...meta });
    }
    
    error(message: string, error?: any) {
        logger.error(message, {
            context: this.context,
            error: error instanceof Error ? error.message : error
        });
    }
}
