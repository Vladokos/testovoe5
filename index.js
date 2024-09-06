const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require("./verifyToken.js");
const logger = require('./logger');

require('dotenv').config()

const app = express();
app.use(express.urlencoded({
    extended: true
}));

const refer = [
    {
        id: 1,
        firstName: "Vladimir",
        secondName: "Pushkin",
        patronymic: "Olegovich",
        phoneNumber: "+79927535214",
        email: "somemail@mail.ru",
        lessons: 0,
        invited: 0,
    },
    {
        id: 2,
        firstName: "Test",
        secondName: "Test",
        patronymic: "Test",
        phoneNumber: "+79427534323",
        email: "test@mail.ru",
        lessons: 0,
        invited: 0,
    }
]

const student = [];


app.get("/api/generateInvite", (req, res) => {
    try {
        const link = `${process.env.SITE_ADDRESS}/registration?ref=${refer[0].id}`;

        res.send({ link: link }).status(200);

        logger.info("successfully generate invite")
    } catch (error) {
        console.log("api generate error:\n " + error);

        logger.error("generate invite unsuccessfully")

        return res.send(500);
    }
})

app.get("/registration", (req, res) => {
    try {
        const referredId = req.query.ref;

        res.send(`
        <form action="/registration" method="post">
            <input type="hidden" id="referrerId" name="referrerId" value="${referredId}">
            <label for="fullName">Фамилия:</label><br>
            <input type="text" id="secondName" name="secondName"><br><br>
            <label for="fullName">Имя:</label><br>
            <input type="text" id="firstName" name="firstName"><br><br>
            <label for="fullName">Отчество:</label><br>
            <input type="text" id="patronymic" name="patronymic"><br><br>
            <label for="phone">Телефон:</label><br>
            <input type="text" id="phone" name="phone"><br><br>
            <label for="email">Email:</label><br>
            <input type="email" id="email" pattern="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$" name="email"><br><br>
            <input type="submit" value="Зарегистрироваться">
        </form>
        `)
        logger.info("successfully registration send form")
    } catch (error) {
        console.log('reg fail:\n ' + error);

        logger.error("registration from unsuccessfully ")

        return res.send(500);
    }


});

app.post("/registration", (req, res) => {
    try {

        const { firstName, secondName, patronymic, phone, email, referrerId } = req.body;

        const oldUser = student.find(student => student.email === email);

        if (!oldUser) {
            const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' });
            student.push({
                id: student.length,
                firstName,
                secondName,
                patronymic,
                phone,
                email,
                referrerId,
                lastPay: null,
                lessons: 0,
                token
            })
            for (let i = 0; i < refer.length; i++) {
                if (refer[i].id === Number(referrerId)) {
                    refer[i].invited += 1;

                }
            }

            res.status(200).json({ token });
            logger.info("successfully registration ")

        } else {
            res.sendStatus(406)
            logger.info("successfully registration ")

        }
    } catch (error) {
        console.log('error reg: \n' + error);

        logger.error("registration unsuccessfully")

        return res.send(500);
    }
})

app.post("/api/successPayment", verifyToken, (req, res) => {
    try {

        const { studentId, referrerId } = req.body;

        for (let i = 0; i < student.length; i++) {
            if (student[i].id === Number(studentId)) {
                student[i].lastPay = Date.now();
                student[i].lessons = 4;
            }
        }

        for (let i = 0; i < refer.length; i++) {
            if (refer[i].id === Number(referrerId)) {
                refer[i].lessons += 4;
            }
        }

        res.sendStatus(200);

        logger.info("successfully payment ")

    } catch (error) {
        console.log('error payment: \n' + error);

        logger.error("unsuccessfully payment ")

        return res.send(500);
    }
})

app.get("/api/statInvitedStudents", (req, res) => {
    try {

        const stats = refer.map((ref) => {
            return {
                name: ref.firstName,
                amount: ref.invited
            }
        });

        res.status(200).json({ stats });
        logger.info("successfully stats")
    } catch (error) {
        console.log('error invite: \n' + error);

        logger.error("unsuccessfully stats ")

        return res.send(500);
    }
})

app.listen(3000)