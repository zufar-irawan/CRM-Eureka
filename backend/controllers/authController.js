import User from "../models/usersModel.js";
import { Role } from "../models/rolesModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ 
            where: { email },
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const md5Hash = crypto.createHash('md5').update(password).digest('hex');
        if (user.password !== md5Hash) {
            return res.status(401).json({ message: "Password salah" });
        }

        const roles = user.roles || [];
        const primaryRole = roles.length > 0 ? roles[0].name : 'user';

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: roles,
            roleNames: roles.map(role => role.name),
            primaryRole: primaryRole,
            role: primaryRole, 
            isAdmin: roles.some(role => role.name === 'admin'),
            isSales: roles.some(role => role.name === 'sales'),
            isPartnership: roles.some(role => role.name === 'partnership'),
            isAkunting: roles.some(role => role.name === 'akunting')
        };

        const token = jwt.sign(
            { 
                userId: user.id,
                name: user.name,
                email: user.email,
                roles: roles.map(role => role.name),
                primaryRole: primaryRole
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // simpan token ke cookie HttpOnly
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: "Login berhasil",
            user: userData,
            permissions: {
                canCreateLeads: true,
                canEditLeads: ['admin', 'sales'].some(role => roles.map(r => r.name).includes(role)),
                canDeleteLeads: roles.some(role => role.name === 'admin'),
                canManageUsers: roles.some(role => role.name === 'admin'),
                canViewReports: ['admin', 'sales', 'partnership'].some(role => roles.map(r => r.name).includes(role)),
                canApproveContracts: ['admin', 'partnership', 'akunting'].some(role => roles.map(r => r.name).includes(role))
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const me = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, { 
            attributes: ['id', 'name', 'email', 'created_at'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const roles = user.roles || [];
        const primaryRole = roles.length > 0 ? roles[0].name : 'user';

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            roles: roles,
            roleNames: roles.map(role => role.name),
            primaryRole: primaryRole,
            role: primaryRole, 
            isAdmin: roles.some(role => role.name === 'admin'),
            isSales: roles.some(role => role.name === 'sales'),
            isPartnership: roles.some(role => role.name === 'partnership'),
            isAkunting: roles.some(role => role.name === 'akunting')
        };

        res.status(200).json({
            message: "User data berhasil diambil",
            data: userData
        });
    } catch (error) {
        console.error('Me endpoint error:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const refreshUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, { 
            attributes: ['id', 'name', 'email', 'created_at', 'updated_at'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const roles = user.roles || [];
        const primaryRole = roles.length > 0 ? roles[0].name : 'user';

        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name,
                roles: roles.map(role => role.name),
                primaryRole: primaryRole
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // update cookie
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            message: "User data berhasil di-refresh",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
                updated_at: user.updated_at,
                roles,
                roleNames: roles.map(role => role.name),
                primaryRole,
            }
        });
    } catch (error) {
        console.error('Refresh user endpoint error:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({ 
            success: true,
            message: "Logout berhasil",
            data: { logoutAt: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            message: "Terjadi kesalahan pada server" 
        });
    }
};
