import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import brevo from "@getbrevo/brevo";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

export async function sendReminderEmail(matchDateTime) {
  const recipientEmail = process.env.RECIPIENT_EMAIL;

  const matchTime = matchDateTime.format("HH:mm");
  const reminderTime = matchDateTime.add(60, "minutes");

  const emailTemplate = `
    <html>
    <body>
      <div style="background-color: #005baa; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1>⚠️ Erinnerung: TSV 1860 München Abpfiff in 30 Minuten! ⚠️</h1>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px;">Der Anpfiff war um <strong>${matchTime}</strong> 🕒</p>
        <p style="font-size: 16px; color: #005baa;">Jetzt ist die Zeit, sich auf besoffene Fans vorzubereiten! 💙🤍</p>
      </div>
      <div style="background-color: #005baa; color: #ffffff; padding: 10px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 14px;">Auf geht’s, Löwen! 🦁⚽</p>
      </div>
    </body>
    </html>
  `;

  let apiInstance = new brevo.TransactionalEmailsApi();
  let apiKey = apiInstance.authentications["apiKey"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  let sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "💩💩💩 TSV 1860 München spielt in 30 min 💩💩💩";
  sendSmtpEmail.htmlContent = emailTemplate;
  sendSmtpEmail.textContent = `60er spielen gleich!!! Anpfiff um ${matchTime} Uhr.`;
  sendSmtpEmail.sender = { name: "60er Alarm", email: "info@bene.cool" };
  sendSmtpEmail.to = [{ email: recipientEmail, name: "Iga" }];
  sendSmtpEmail.scheduledAt = new Date(reminderTime.toDate());

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "Reminder sent successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
    }
  );
}
