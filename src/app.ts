import { Telegraf } from 'telegraf';
import { Bot } from './bot';
import { ConfigService } from './services/config.service';

export class App {
	async init() {
		const configService = new ConfigService();
		let token = configService.get('BOT_TOKEN');
		let sender = configService.get('SENDER');
		const telegraf = new Telegraf(token);
		const bot = new Bot(telegraf, token, sender);
		const first = await bot.init();
		if (first) {
			const token = configService.get('OLD_TOKEN');
			const sender = configService.get('OLD_SENDER');
			const telegraf = new Telegraf(token);
			const bot = new Bot(telegraf, token, sender);
			await bot.init();
		}
		////
	}
}
