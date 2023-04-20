import 'dotenv/config';
export class ConfigService {
	get(token: string) {
		const result = process.env[token];
		if (!result) {
			throw new Error(`Missing .env prop - ${token}\n\nDOTENV`);
		}
		return result;
	}
}
