import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if(!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Akses ditolak, token tidak ditemukan' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userName = decoded.name;
        req.token = token; 
        
        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token telah kedaluwarsa' 
            });
        }
        res.status(401).json({ 
            success: false,
            message: 'Token tidak valid' 
        });
    }
}

export default authMiddleware;