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
exports.App = void 0;
const telegraf_1 = require("telegraf");
const bot_1 = require("./bot");
const config_service_1 = require("./services/config.service");
class App {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const configService = new config_service_1.ConfigService();
            let token = configService.get('BOT_TOKEN');
            let sender = configService.get('SENDER');
            const telegraf = new telegraf_1.Telegraf(token);
            const bot = new bot_1.Bot(telegraf, token, sender);
            const first = yield bot.init();
            if (!first) {
                const token = configService.get('OLD_TOKEN');
                const sender = configService.get('OLD_SENDER');
                const telegraf = new telegraf_1.Telegraf(token);
                const bot = new bot_1.Bot(telegraf, token, sender);
                yield bot.init();
            }
            ////
        });
    }
}
exports.App = App;
