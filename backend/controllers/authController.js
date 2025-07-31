import User from "../models/usersModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"; 

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email }});
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const md5Hash = crypto.createHash('md5').update(password).digest('hex');
        if(user.password !== md5Hash) {
            return res.status(401).json({ message: "Password Salah" });
        } 

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login Berhasil", 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const me = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, { 
            attributes: ['id', 'name', 'email'],
        });

        if(!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

