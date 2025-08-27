
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { sequelize } from './config/db.js';
import cookieParser from 'cookie-parser';
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
import path from 'path';
import { fileURLToPath } from 'url'; 
import { ensureUploadDir } from './utils/uploadUtils.js';
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}))

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads' )));
await ensureUploadDir();

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
