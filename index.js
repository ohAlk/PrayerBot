/////////////////////// ******** //////////////////////
const CITY = "Doha"; // المدينة بالإنجليزي
const AR_CITY = "الدوحة" // المدينة بالعربي
const COUNTRY = "Qatar"; // الدولة بالإنجليزي
const channelId = "" // ايدي الروم
const METHOD = 9;  // KSA = 4 | Egypt = 5 // more: https://aladhan.com/calculation-methods

const TOKEN = ""; // YOUR BOT TOKEN
/////////////////////// ******** //////////////////////

let cooldown = new Set();
const axios = require('axios');
const { Client, Intents, MessageEmbed } = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        // Intents.FLAGS.GUILD_MESSAGES,
    ]
});


client.on("ready", () => {
    // logs when the bot is online
    console.log(`Prayer Bot is ready as: ${client.user.tag}`);
    client.user.setActivity(`ربِّ زِدني عِلمًا`, { type: 'WATCHING' });

    let channel = client.channels.cache.get(channelId);
    if (!channel) return console.log("i can't find the prayer channel !!!")

    setInterval(async () => {
        if (cooldown.has("Wait!!")) return;

        let prayerTimes = await getPrayerTimes();

        let NOW = new Date();
        let hour = NOW.getHours();
        let min = NOW.getMinutes();

        for (let i in prayerTimes) {
            if (cooldown.has("Wait!!")) return;
            let theDate = new Date(prayerTimes[i]);
            console.log(theDate.getHours(), theDate.getMinutes())

            if (theDate.getHours() == hour && theDate.getMinutes() == min) {
                cooldown.add("Wait!!")
                setTimeout(() => cooldown.delete("Wait!!"), 300000);

                let channel = client.channels.cache.get(channelId);
                if (channel) {
                    let embed = new MessageEmbed()
                        .setTitle(`حان الآن موعد أذان ${i} بتوقيت ${AR_CITY}`)
                        .setColor("GREEN") // GREEN RED BLUE ...
                        .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL({ dynamic: true }) });

                    channel.send({ embeds: [embed] }).catch(e => console.log(e));
                };
                break;
            };
        };

    }, 59000)
});





async function getPrayerTimes() {
    let response = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${CITY}&country=${COUNTRY}&method=${METHOD}&iso8601=true`).catch(error => {
        console.log(error);
    });

    const timings = response.data.data.timings;
    const prayerTimes = {
        "الفجر": timings.Fajr,
        "الظهر": timings.Dhuhr,
        "العصر": timings.Asr,
        "المغرب": timings.Maghrib,
        "العشاء": timings.Isha
    };
    return prayerTimes;
};

client.login(TOKEN);
