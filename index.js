const express = require('express');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const ping = require('ping');
require('dotenv').config()

const { hosts } = require('./hosts');
const {
  user,
  pass,
  reply,
  hostMail,
  portMail,
} = process.env;

const PORT = 3000;

const app = express();

const job = schedule.scheduleJob('30 * * * *', () => {
  hosts.forEach(function(host){
    ping.sys.probe(host, function(isAlive){
      if (!isAlive) {
        const transporter = nodemailer.createTransport({
          host: hostMail,
          port: Number(portMail),
          auth: { user, pass },
        });

        transporter.sendMail({
          from: user,
          to: reply,
          subject: `Site ${host} OFF - ATENÇÃO PARA ESTE EMAIL`,
          replyTo: reply,
          text: `ATENÇÃO - host ${host} está OFFLINE`,
        });
      }
      const msg = isAlive
        ? `host ${host} is alive`
        : `host ${host} is dead`;
      console.log(msg);
    });
  });
});

// Rota apenas para testar se o server está online
app.get('/', (req, res) => {
  try {
    res.status(200).json({ message: 'Server Online' });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Envio atráves de uma requisição
// app.get('/send', (req, res) => {
//   const transporter = nodemailer.createTransport({
//     host,
//     port: Number(portMail),
//     auth: { user, pass },
//   });

//   transporter.sendMail({
//     from: user,
//     to: reply,
//     subject: textSubject,
//     replyTo: reply,
//     text: textMessage,
//   })
//     .then(info => {
//       res.status(200).json({ message: info });
//     })
//     .catch(error => {
//       res.status(500).json({ message: error });
//     });
// });

app.listen(PORT, () => console.log(`Online na Porta ${PORT}`));