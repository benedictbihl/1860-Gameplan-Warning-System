// i had chat gpt write this 100% 🤷🏻‍♂️

import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const apiURL = "https://api.openligadb.de/getmatchesbyteamid/125/0/1";

async function checkForMatch() {
  try {
    const response = await axios.get(apiURL);
    const matches = response.data;

    if (matches.length === 0) {
      console.log("No matches found.");
      return;
    }

    const firstMatch = matches[0];
    const matchDateTime = dayjs(firstMatch.matchDateTime).tz("Europe/Berlin");

    const tomorrow = dayjs().tz("Europe/Berlin").add(1, "day").startOf("day");
    const isMatchTomorrow = matchDateTime.isSame(tomorrow, "day");

    if (!isMatchTomorrow) {
      console.log("Match found for tomorrow. Sending email...");
      await sendEmail(matchDateTime);
    } else {
      console.log("No match tomorrow.");
    }
  } catch (error) {
    console.error("Error fetching match data:", error);
  }
}

async function sendEmail(matchDateTime) {
  const recipientEmail = process.env.RECIPIENT_EMAIL;

  if (!recipientEmail) {
    console.error("No recipient email provided.");
    return;
  }

  const matchTime = matchDateTime.format("HH:mm");
  const matchDay = matchDateTime.format("DD.MM.YYYY");
  const emailTemplate = `
  <!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spielwarnung: TSV 1860 München</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #005baa; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1>🚨 Spielalarm! 🚨</h1>
            <h2>TSV 1860 München</h2>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 18px;">Morgen, am ${matchDay} ist es soweit! 🎉</p>
            <p style="font-size: 16px;">Anpfiff ist um <strong>${matchTime}</strong>  🕒</p>
            <p style="font-size: 16px; color: #005baa;">Auf geht’s, Sechzig! 💙🤍</p>
        </div>
        <div style="background-color: #005baa; color: #ffffff; padding: 10px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px;">Löwen, wir sehen uns morgen im Stadion! 🏟️</p>
        </div>
    </div>
</body>
</html>

  `;

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
  });

  const sentFrom = new Sender("info@bene.cool", "TSV 1860 München Bot");

  const recipients = [new Recipient(recipientEmail, "Iga")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("🚨Spielalarm: TSV 1860 München spielt morgen!🚨")
    .setHtml(emailTemplate)
    .setText(`60er spielen morgen! Anpfiff um ${matchTime} Uhr.`);

  try {
    await mailerSend.email.send(emailParams);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

checkForMatch();
