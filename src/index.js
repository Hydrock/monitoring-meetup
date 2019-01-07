'use strict';

const nodemailer = require('nodemailer');
const http = require('http');
const https = require('https'); // Этот модуль если запрос по протоколу https

//const targetLink = 'http://nekrasovka.ru/afisha/19-01-2019/1224';
const targetLink = 'https://gist.github.com/Hydrock/af73cd10eb0b93d017e228be1c13e080';

const timePeriod = 1000; // будем проверять каждые 5 минут
let index;
function setMonitor () {
    // Тут делаем запрос и формируем тело ответа
    https.get(targetLink, (res) => {
        // Так как тело ответа прилетает порциями,
        // кладем все в массив и затем формируем строку ответа
        let body = [];
        res.on('data', function (chunk) {
            body.push(chunk);
        });

        // Проверяем наличение строки в ответе
        res.on('end', () => {
            body = Buffer.concat(body).toString();
            index = body.indexOf('Регистрация на мероприятие завершена');
        });
    })

    // Если в теле ответа есть строка 'Регистрация на мероприятие завершена',
    // запускаем мониторинг еще раз, иначе пишем что пора регистрироваться!
    if (index !== -1) {
        setTimeout(() => {
            console.log('Пока ничего нет...');
            // Запускаем пониторинг повторно
            setMonitor();
        }, timePeriod);
    } else {
        console.log('Ура! Доступно! Скорее регайся!');
        // Отправляем тут письмо.
        sendMail(mailOptions);
    }
}

setMonitor();

// HTML контент письма
const output = `
<p>Срочно регистрируйся! 🤓</p>
<label>Вот тебе ссылка</label>
<a href="${targetLink}">${targetLink}</a>
`;

// Опции отправки почты
let mailOptions = {
    from: 'hydrock@yandex.ru', // почта отправителя
    to: 'hydrock@yandex.ru', // лист адресов получателей через запятую
    subject: 'Срочное оповещение', // Заголовок письма
    text: 'Срочно регистрируйся! 😨', // Текст письма если нет тела письма в html
    html: output // html тело письма
};

// Отправляет письмо
function sendMail(mailOptions) {
    // Создаем обьект транспортера
    // Авторизируемся
    let smtpTransport;
    try {
        smtpTransport = nodemailer.createTransport({
                host: 'smtp.yandex.ru',
                port: 465,
                secure: true, // true для 465, false для других портов 587
                auth: {
                user: "hydrock@yandex.ru", // почта пользователя для авторизации
                pass: "secretPassword" // пароль пользователя
            }
        });
    } catch (e) {
        return console.log('Ошибка: ' + e.name + ":" + e.message);
    }

    // Отправляем письмо
    smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log('Ошибка');
        } else {
          console.log('Сообщение отправлено: %s', info.messageId);
        }
    });
}

console.log('Мониторинг запущен!');