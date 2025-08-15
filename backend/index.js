import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { sequelize } from './config/db.js';
import leadsRouter from './routes/leadsRoutes.js';
import tasksRouter from './routes/tasksRoutes.js';
import authRouter from './routes/authRoutes.js';
import dealsRouter from './routes/dealsRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import contactsRouter from './routes/contactsRoutes.js'
import companiesRouter from './routes/companiesRoutes.js'
import { setupAssociations } from './models/associations.js';
import kpiRouter from './routes/kpiRoutes.js'
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
setupAssociations();
app.use("/api/auth", authRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/users", usersRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/companies", companiesRouter)
app.use("/api/kpi", kpiRouter)

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port`);
})
