import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, 'pharmacy_secret_key');
            req.user = decoded.user;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token invalid' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};

export default protect;
