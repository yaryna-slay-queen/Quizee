export function requireAuth(req, res, next) {
    if (!req.cookies.userId) return res.redirect('/login');
    req.userId = parseInt(req.cookies.userId, 10);

    if (isNaN(req.userId)) return res.redirect('/login');
    next();
}