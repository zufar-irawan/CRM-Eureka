import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { sequelize } from './config/db.js';
import leadsRouter from './routes/leadsRoutes.js';
import tasksRouter from './routes/tasksRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto',
    }
}))

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(express.json());
app.use("/api/leads", leadsRouter);
app.use("/api/tasks", tasksRouter);

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port`);
})
