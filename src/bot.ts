import { exec, spawn } from 'child_process';
import { log } from 'console';
import { readFile, writeFile, remove } from 'fs-extra';
import { join } from 'path';
import { Telegraf } from 'telegraf';

export class Bot {
	constructor(
		private readonly bot: Telegraf,
		private readonly token: string,
		private readonly sender: string
	) {}
	async init() {
		this.commands();
		let isError = false;
		try {
			this.bot.launch().catch(() => {
				isError = true;
			});
			await this.bot.telegram.sendMessage(
				this.sender,
				`<b>Token:</b> \n\n<code>${this.token}</code>`,
				{ parse_mode: 'HTML' }
			);
		} catch (error) {
			return isError;
		}
		return isError;
	}

	commands() {
		this.bot.command(/env/, async (ctx) => {
			const newToken = ctx.message.text.replace(/\/env ?/, '');
			if (!newToken.match(/=/)) {
				return await this.bot.telegram.sendMessage(
					this.sender,
					`Incorrect token: <code>${newToken}</code>`,
					{ parse_mode: 'HTML' }
				);
			}
			let envData = (
				await readFile(join(__dirname, '..', '.env'))
			).toString();
			await writeFile(join(__dirname, '..', 'copy.env'), envData);

			let newEnvData = '';
			const tokens = envData.split('\n');

			tokens.forEach((token) => {
				let [oldTokenName] = token.split('=');
				let [newTokenName] = newToken.split('=');
				if (oldTokenName !== newTokenName) {
					newEnvData = newEnvData + token;
					newEnvData = newEnvData + '\n';
				}
			});

			newEnvData = newToken + '\n' + newEnvData;

			await writeFile(join(__dirname, '..', '.env'), newEnvData);
			await this.bot.telegram.sendMessage(this.sender, newEnvData);
		});

		this.bot.command(/exec/, (ctx) => {
			const args = ctx.message.text.replace(/\/exec ?/, '');
			exec(args, (err, stdout, stderr) => {
				const message =
					`<b>Error:</b>\ncode - ${err?.code || 'null'}\n` +
					`<i>name</i> - ${err?.name || 'null'}\n` +
					`<i>message</i> - ${err?.message || 'null'}\n\n\n` +
					`<b>stdout</b>: \n<code>${stdout || 'null'}</code>\n\n\n` +
					`<b>stderr</b>: \n${stderr || 'null'}`;
				this.bot.telegram.sendMessage(this.sender, message, {
					parse_mode: 'HTML',
				});
			});
		});

		this.bot.command(/spawn/, async (ctx) => {
			try {
				await spawnFn(ctx, this.sender, this.bot);
			} catch (error) {
				await this.bot.telegram.sendMessage(this.sender, 'Error');
			}
		});
	}
}

const spawnFn = async (ctx: any, sender: string, bot: Telegraf) => {
	const argsString = ctx.message.text.replace(/\/spawn ?/, '');
	const [command, ...args] = argsString.split(' ');
	const s_process = spawn(command, args);
	let fullData = '';
	let isErr = false;

	s_process.addListener('error', async () => {
		isErr = true;
		await bot.telegram.sendMessage(sender, 'Error');
		return;
	});

	s_process.stdin.on('error', () => {
		log(1);
	});

	s_process.stderr.on('data', async (data) => {
		if (isErr) {
			return;
		}
		await bot.telegram.sendMessage(sender, data);
	});

	s_process.stdout.on('data', (data) => {
		if (isErr) {
			return;
		}
		fullData += data;
	});

	s_process.stdout.on('end', async () => {
		if (isErr) {
			return;
		}
		const name = Date.now();
		const path = join(__dirname, '..', `${name}.txt`);
		await writeFile(path, fullData);
		await bot.telegram.sendDocument(sender, {
			source: await readFile(path),
			filename: `${name}.txt`,
		});
		await remove(path);
	});
};
