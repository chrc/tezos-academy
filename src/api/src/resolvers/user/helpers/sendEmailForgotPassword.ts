import { MailDataRequired } from '@sendgrid/helpers/classes/mail'
import * as sendgrid from '@sendgrid/mail'

interface SendEmailForgotPassword {
  (email: string, captchaIndex: number, token: string): Promise<void>
}

export const sendEmailForgotPassword: SendEmailForgotPassword = async (email, captchaIndex, token) => {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)

  const message: MailDataRequired = {
    to: email,
    from: { name: 'TezosAcademy', email: process.env.FROM_EMAIL as string },
    subject: 'Password reset',
    text: `Please enter the following captcha https://b2.tezosacademy.io/file/tezosacademy/captchas/${captchaIndex}.png on https://tezosacademy.io/reset-password?key=${token}`,
    html: `Please enter the following captcha <br /><img alt="captcha" src="https://b2.tezosacademy.io/file/tezosacademy/captchas/${captchaIndex}.png" /> <br />on <a href="https://tezosacademy.io/reset-password?key=${token}">https://tezosacademy.io/reset-password?key=${token}</a>`,
  }

  await sendgrid.send(message)
}
