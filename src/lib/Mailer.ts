import "jsh";
import * as nodeMailer from "nodemailer";

const SMTP_GMAIL = env.assert("SMTP_GMAIL");
const transporter = nodeMailer.createTransport(SMTP_GMAIL);
const fromEmail = SMTP_GMAIL.split(":")[1].replace("//", "");
const toEmail = fromEmail;

export function sendEmail(subject: string, html: string) {
  // return transporter.sendMail({
  //   from: fromEmail,
  //   to: toEmail,
  //   subject,
  //   html,
  // });
}
