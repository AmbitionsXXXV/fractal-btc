import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import * as winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

// 因为使用了 ESM，所以需要使用 fileURLToPath 获取 __filename 和 __dirname
const __filenameNew = fileURLToPath(import.meta.url)
const __dirnameNew = path.dirname(__filenameNew)
const logDir = process.env.LOG_DIR
	? path.join(process.env.LOG_DIR, "./logs")
	: path.join(__dirnameNew, "../logs")

// 如果不存在就创建
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir)
}
const { combine, timestamp, printf } = winston.format

const myFormat = printf(
	({ level, message, timestamp }) =>
		`${timestamp} [${level.toUpperCase()}]: ${message}`,
)

const myFormatColor = winston.format.printf(({ level, message, timestamp }) => {
	let color = ""

	if (level === "error") {
		color = "\x1b[31m" // 红色
	} else if (level === "warn") {
		color = "\x1b[33m" // 黄色
	} else if (level === "info") {
		color = "\x1b[36m" // 青色
	}

	const levelStr = color ? `${color}${level}\x1b[0m` : level

	return `${timestamp} [${levelStr}]: ${message}`
})

export const logger = winston.createLogger({
	format: combine(
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		myFormat,
	),
	transports: [
		new DailyRotateFile({
			level: "error",
			filename: `${logDir}/%DATE%-error.log`,
			datePattern: "YYYY-MM-DD",
			zippedArchive: false,
			maxSize: "1m",
			maxFiles: "14d",
		}),
		new DailyRotateFile({
			level: "warn",
			filename: `${logDir}/%DATE%-warn.log`,
			datePattern: "YYYY-MM-DD",
			zippedArchive: false,
			maxSize: "1m",
			maxFiles: "14d",
		}),
		new DailyRotateFile({
			level: "info",
			filename: `${logDir}/%DATE%-info.log`,
			datePattern: "YYYY-MM-DD",
			zippedArchive: false,
			maxSize: "1m",
			maxFiles: "14d",
		}),
		new winston.transports.Console({
			format: combine(
				timestamp({
					format: "YYYY-MM-DD",
				}),
				winston.format.colorize(),
				myFormatColor,
			),
		}),
	],
})
