import User from "../models/usersModel.js";
import { Op } from "sequelize";

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'created_at', 'updated_at']
        });
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.status(200).json({
            message: "Detail user berhasil diambil",
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        const whereClause = search ? {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ]
        } : {};
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'created_at'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        })
        res.status(200).json({
            message: "Daftar user berhasil diambil",
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        if (req.userId !== parseInt(id)) {
            return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah profil ini" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        await user.update(updateData);
        const updatedUser = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'updated_at']
        });

        res.status(200).json({
            message: "Profil berhasil diperbarui",
            data: updatedUser
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};