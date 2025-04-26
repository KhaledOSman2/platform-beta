// إدارة ملفات Cloudinary (رفع، حذف، استبدال) للكورسات والأنشطة
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// إعداد Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// إعداد التخزين عبر Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const folder = 'the-platform';
        let resource_type = 'raw';
        if (file.mimetype.startsWith('image/')) resource_type = 'image';
        else if (file.mimetype.startsWith('video/')) resource_type = 'video';
        return {
            folder,
            resource_type,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`.replace(/[^a-zA-Z0-9-_]/g, ''),
            format: file.mimetype.split('/')[1] || undefined
        };
    }
});
const upload = multer({ storage });

// استخراج public_id من رابط Cloudinary
function extractCloudinaryPublicId(fileUrl) {
    if (!fileUrl) return null;
    try {
        const patterns = ['/image/upload/', '/video/upload/', '/raw/upload/', '/upload/'];
        let uploadIndex = -1;
        let matchedPattern = '';
        for (const pattern of patterns) {
            uploadIndex = fileUrl.indexOf(pattern);
            if (uploadIndex !== -1) {
                matchedPattern = pattern;
                break;
            }
        }
        if (uploadIndex !== -1) {
            let publicIdWithFolders = fileUrl.substring(uploadIndex + matchedPattern.length);
            publicIdWithFolders = publicIdWithFolders.replace(/^v\d+\//, '');
            publicIdWithFolders = publicIdWithFolders.split('?')[0];
            // إذا كان الرابط يحتوي على /raw/، لا تزل الامتداد
            if (matchedPattern === '/raw/upload/') {
                return publicIdWithFolders;
            } else {
                const lastDot = publicIdWithFolders.lastIndexOf('.');
                if (lastDot !== -1) publicIdWithFolders = publicIdWithFolders.substring(0, lastDot);
                return publicIdWithFolders;
            }
        }
    } catch (e) { }
    return null;
}

// تحديد نوع المورد
function getCloudinaryResourceType(fileUrl) {
    if (!fileUrl) return 'image';
    if (fileUrl.includes('/video/')) return 'video';
    if (fileUrl.includes('/raw/')) return 'raw';
    if (fileUrl.includes('/image/')) return 'image';
    const ext = fileUrl.split('.').pop().toLowerCase();
    if ([ 'mp4', 'mov', 'avi', 'webm', 'mkv' ].includes(ext)) return 'video';
    if ([ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg' ].includes(ext)) return 'image';
    if ([ 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar' ].includes(ext)) return 'raw';
    return 'raw';
}

// حذف ملف من Cloudinary
async function deleteCloudinaryFileByUrl(fileUrl) {
    if (!fileUrl) return;
    const publicId = extractCloudinaryPublicId(fileUrl);
    if (!publicId) {
        console.error('[Cloudinary Delete] publicId extraction failed for:', fileUrl);
        return;
    }
    // جرب كل الأنواع الممكنة
    const resourceTypes = ['raw', 'image', 'video'];
    for (const resourceType of resourceTypes) {
        try {
            const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
            console.log(`[Cloudinary Delete] Try type: ${resourceType} =>`, result);
            if (result.result === 'ok') return;
        } catch (e) {
            console.error(`[Cloudinary Delete] Exception for type ${resourceType}:`, e);
        }
    }
    console.warn('[Cloudinary Delete] File not found in any resource_type:', fileUrl, publicId);
}

// رفع صورة كورس
const uploadCourseImage = upload.single('courseImage');
// رفع ملف نشاط
const uploadActivityFile = upload.single('activityFile');

// استبدال صورة كورس (يحذف القديمة من Cloudinary)
async function replaceCourseImage(oldUrl, file) {
    if (oldUrl) await deleteCloudinaryFileByUrl(oldUrl);
    return file ? file.path : '';
}

// استبدال ملف نشاط (يحذف القديم من Cloudinary)
async function replaceActivityFile(oldUrl, file) {
    if (oldUrl) await deleteCloudinaryFileByUrl(oldUrl);
    return file ? file.path : '';
}

module.exports = {
    uploadCourseImage,
    uploadActivityFile,
    replaceCourseImage,
    replaceActivityFile,
    deleteCloudinaryFileByUrl
};
