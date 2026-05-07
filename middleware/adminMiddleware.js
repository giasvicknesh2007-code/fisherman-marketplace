const adminMiddleware = (req, res, next) => {
    // Note: authMiddleware must be called before this to populate req.user
    // In our authMiddleware, we only have {id}. We need to fetch the user role.
    // However, we can include role in the JWT token for efficiency.
    
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admins only."
        });
    }
};

module.exports = adminMiddleware;
