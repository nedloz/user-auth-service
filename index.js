require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const usersRoutes = require('./routes/userRoutes');
const authRoutes = require
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'https://my-app.com'], // 2е для прода, добавить сюда адрес фронта!
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 10 попыток за окно
    message: {
      error: 'Слишком много попыток. Попробуйте позже.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(helmet());
app.use(rateLimiter);

app.use('/auth', authRoutes);
app.use('/users/me', usersRoutes);
app.use((req, res, next) => {
    res.status(404).json({ error: 'Маршрут не найден' });   
});
app.use(errorHandler);

(async () => {
    try { 
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(3000, () => console.log('Сервер запущен на порту: 3000'));

    } catch (err) {
        logger.error('Ошибка подключения к mongoDB: ' + err.message);
        process.exit(1);
    }
})();

// что осталось сделать: 
// обработку картинок updateUser
// отправку смс
