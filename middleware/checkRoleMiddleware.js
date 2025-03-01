// Middleware to check user role
function checkRole(role) {
    return (req, res, next) => {
        const userRole = req.headers['role']; // Role passed in the request header
        if (userRole === role) {
            next();
        } else {
            res.status(403).send('Access denied');
        }
    };
}

module.exports=checkRole;