
(function() {
    // تشغيل الفحص عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', validateToken);
    
    // تنفيذ فحص دوري للتوكن (كل 30 ثانية)
    setInterval(validateToken, 30000);
    
    /**
     * التحقق من صلاحية التوكن
     */
    async function validateToken() {
        try {
            // الحصول على التوكن من التخزين المحلي
            const token = localStorage.getItem('token');
            
            // إذا لم يكن هناك توكن، لا تحتاج إلى فحص
            if (!token) return;
            
            // إرسال طلب للتحقق من صلاحية التوكن
            const response = await fetch('/api/validate-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            
            // إذا كانت الاستجابة ليست ناجحة (401 أو 403)، فهذا يعني أن التوكن منتهي الصلاحية
            if (!response.ok) {
                console.warn('توكن المستخدم منتهي الصلاحية أو غير صالح');
                handleExpiredToken();
            }
        } catch (error) {
            console.error('خطأ أثناء التحقق من صلاحية التوكن:', error);
        }
    }
    
    /**
     * معالجة انتهاء صلاحية التوكن
     */
    function handleExpiredToken() {
        console.log('تنفيذ عملية تسجيل الخروج نظرًا لانتهاء صلاحية التوكن...');
        
        // مسح التوكن من localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('grade');
        localStorage.removeItem('cachedUserData');
        localStorage.removeItem('cachedNotifications');
        localStorage.removeItem('user');
        localStorage.removeItem('notifications');
        localStorage.removeItem('userGrade');
        localStorage.removeItem('adminJustLoggedIn');
        localStorage.removeItem('subsJustLoggedIn');
        localStorage.removeItem('justLoggedIn');
        
        // مسح التوكن من sessionStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('notifications');
        sessionStorage.removeItem('userGrade');
        
        // مسح التوكن من cookies
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // إرسال طلب تسجيل الخروج للخادم لمسح HttpOnly cookies
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        }).finally(() => {
            // توجيه المستخدم إلى صفحة تسجيل الدخول مع علامة انتهاء الجلسة
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?logout=2';
            }
        });
    }
    
    // إضافة وظيفة للاستخدام العام للتعامل مع أخطاء الطلبات
    window.handleTokenError = function(status) {
        // إذا كان الخطأ 401 أو 403، فقد تكون المشكلة في التوكن
        if (status === 401 || status === 403) {
            handleExpiredToken();
            return true;
        }
        return false;
    };
})();
