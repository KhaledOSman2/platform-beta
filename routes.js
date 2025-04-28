const path = require('path');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const JWT_SECRET = "914a20dddcf9c8d07abf5a4fd19c9895761b2381ca439db756a4a1c479ad37c0";

// ميدلوير للتحقق من التوكن
async function authenticateTokenForRoute(req, res, next) {
    const authHeader = req.headers['authorization'] || req.query.token || req.cookies?.token;
    let token = authHeader;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    if (!token) {
        return res.redirect('/login?from=' + encodeURIComponent(req.path.replace('/', '')));
    }
    jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) return res.redirect('/login?from=' + encodeURIComponent(req.path.replace('/', '')));
        const currentUser = await User.findOne({ id: user.id });
        if (!currentUser || currentUser.isBanned) {
            return res.redirect('/login?from=' + encodeURIComponent(req.path.replace('/', '')));
        }
        req.user = user;
        next();
    });
}

// تحقق لصلاحيات الأدمن
function requireAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect('/login?from=admin');
    }
    next();
}

function setupRoutes(app) {
    // صفحات عامة
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/index.html'));
    });
    app.get('/login', (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/login.html'));
    });
    app.get('/register', (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/register.html'));
    });
    app.get('/courses', (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/courses.html'));
    });
    // صفحة الكورس محمية (يجب أن يكون المستخدم مسجلاً)
    app.get('/course', authenticateTokenForRoute, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/course.html'));
    });
    // لوحة تحكم الطالب محمية
    app.get('/dashboard', authenticateTokenForRoute, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
    });
    app.get('/subscription', authenticateTokenForRoute, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/subscription.html'));
    });
    // صفحات الأدمن محمية ويجب أن يكون المستخدم أدمن
    app.get('/admin', authenticateTokenForRoute, requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/admin.html'));
    });
    app.get('/admin-subs', authenticateTokenForRoute, requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/html/admin-subs.html'));
    });
    // يمكنك إضافة المزيد من المسارات حسب الحاجة
}

module.exports = setupRoutes;
