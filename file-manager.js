// إدارة ملفات Cloudinary (رفع، حذف، استبدال) للكورسات والأنشطة
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

// إعداد Cloudinary باستخدام المتغيرات البيئية
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد multer لتخزين الملفات في الذاكرة
const upload = multer({ storage: multer.memoryStorage() });

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
      let publicId = fileUrl.substring(uploadIndex + matchedPattern.length);
      publicId = publicId.replace(/^v\d+\//, '').split('?')[0];
      if (matchedPattern !== '/raw/upload/') {
        const extIndex = publicId.lastIndexOf('.');
        if (extIndex !== -1) publicId = publicId.substring(0, extIndex);
      }
      return publicId;
    }
  } catch (e) {
    console.error('[Cloudinary] extractPublicId error:', e);
  }
  return null;
}

// تحديد نوع المورد بناءً على MIME أو امتداد الملف
function getCloudinaryResourceType(mimetype, fileUrl) {
  if (mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
  }
  if (fileUrl) {
    if (fileUrl.includes('/video/')) return 'video';
    if (fileUrl.includes('/raw/')) return 'raw';
    if (fileUrl.includes('/image/')) return 'image';
  }
  const ext = fileUrl ? fileUrl.split('.').pop().toLowerCase() : '';
  if (['mp4','mov','avi','webm','mkv'].includes(ext)) return 'video';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image';
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
  const resourceTypes = ['raw', 'image', 'video'];
  for (const type of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: type, invalidate: true });
      console.log(`[Cloudinary Delete] Tried ${type}:`, result);
      if (result.result === 'ok') return;
    } catch (err) {
      console.error(`[Cloudinary Delete] Error for ${type}:`, err);
    }
  }
  console.warn('[Cloudinary Delete] File not found:', fileUrl);
}

// دوال للرفع والاستبدال
async function uploadToCloudinary(buffer, mimetype, folder = 'the-platform') {
  const resource_type = getCloudinaryResourceType(mimetype);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Middleware لرفع صورة الكورس
const uploadCourseImage = upload.single('courseImage');
// Middleware لرفع ملف النشاط
const uploadActivityFile = upload.single('activityFile');

// استبدال صورة كورس (يحذف القديمة ثم يرفع الجديدة)
async function replaceCourseImage(oldUrl, file) {
  if (oldUrl) await deleteCloudinaryFileByUrl(oldUrl);
  if (!file) return '';
  const result = await uploadToCloudinary(file.buffer, file.mimetype, 'courses');
  return result.secure_url;
}

// استبدال ملف نشاط (يحذف القديم ثم يرفع الجديد)
async function replaceActivityFile(oldUrl, file) {
  if (oldUrl) await deleteCloudinaryFileByUrl(oldUrl);
  if (!file) return '';
  const result = await uploadToCloudinary(file.buffer, file.mimetype, 'activities');
  return result.secure_url;
}

module.exports = {
  uploadCourseImage,
  uploadActivityFile,
  replaceCourseImage,
  replaceActivityFile,
  deleteCloudinaryFileByUrl,
  uploadToCloudinary, // إضافة تصدير الدالة هنا
};
