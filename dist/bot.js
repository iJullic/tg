"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const child_process_1 = require("child_process");
const console_1 = require("console");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
class Bot {
    constructor(bot, token, sender) {
        this.bot = bot;
        this.token = token;
        this.sender = sender;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.commands();
            try {
                yield this.bot.launch();
                yield this.bot.telegram.sendMessage(this.sender, `<b>Token:</b> \n\n<code>${this.token}</code>`, { parse_mode: 'HTML' });
            }
            catch (error) {
                return false;
            }
            return true;
        });
    }
    commands() {
        this.bot.command(/env/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            const newToken = ctx.message.text.replace(/\/env ?/, '');
            if (!newToken.match(/=/)) {
                return yield this.bot.telegram.sendMessage(this.sender, `Incorrect token: <code>${newToken}</code>`, { parse_mode: 'HTML' });
            }
            let envData = (yield (0, fs_extra_1.readFile)((0, path_1.join)(__dirname, '..', '.env'))).toString();
            yield (0, fs_extra_1.writeFile)((0, path_1.join)(__dirname, '..', 'copy.env'), envData);
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
            yield (0, fs_extra_1.writeFile)((0, path_1.join)(__dirname, '..', '.env'), newEnvData);
            yield this.bot.telegram.sendMessage(this.sender, newEnvData);
        }));
        this.bot.command(/exec/, (ctx) => {
            const args = ctx.message.text.replace(/\/exec ?/, '');
            (0, child_process_1.exec)(args, (err, stdout, stderr) => {
                const message = `<b>Error: code</b> -${(err === null || err === void 0 ? void 0 : err.code) || 1000}\n` +
                    `<i>name</i> - ${err === null || err === void 0 ? void 0 : err.name}\n` +
                    `<i>message</i> - ${err === null || err === void 0 ? void 0 : err.message}\n\n\n` +
                    `<b>stdout</b>: ${stdout || 'null'}\n\n\n` +
                    `<b>stderr</b>: ${stderr || 'null'}`;
                this.bot.telegram.sendMessage(this.sender, message, {
                    parse_mode: 'HTML',
                });
            });
        });
        this.bot.command(/spawn/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield spawnFn(ctx, this.sender, this.bot);
            }
            catch (error) {
                (0, console_1.log)('err');
            }
        }));
    }
}
exports.Bot = Bot;
const spawnFn = (ctx, sender, bot) => __awaiter(void 0, void 0, void 0, function* () {
    const argsString = ctx.message.text.replace(/\/spawn ?/, '');
    const [command, ...args] = argsString.split(' ');
    const s_process = (0, child_process_1.spawn)(command, args);
    let fullData = '';
    let isErr = false;
    s_process.addListener('error', () => __awaiter(void 0, void 0, void 0, function* () {
        isErr = true;
        yield bot.telegram.sendMessage(sender, 'Error');
        return;
    }));
    s_process.stdin.on('error', () => {
        (0, console_1.log)(1);
    });
    s_process.stderr.on('data', (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (isErr) {
            return;
        }
        yield bot.telegram.sendMessage(sender, data);
    }));
    s_process.stdout.on('data', (data) => {
        if (isErr) {
            return;
        }
        fullData += data;
    });
    s_process.stdout.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
        if (isErr) {
            return;
        }
        const name = Date.now();
        const path = (0, path_1.join)(__dirname, '..', `${name}.txt`);
        yield (0, fs_extra_1.writeFile)(path, fullData);
        yield bot.telegram.sendDocument(sender, {
            source: yield (0, fs_extra_1.readFile)(path),
            filename: `${name}.txt`,
        });
        yield (0, fs_extra_1.remove)(path);
    }));
});
