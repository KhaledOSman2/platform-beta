const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
mongoose.connect("mongodb+srv://kh5355988924:xUc0qYvow1TcIhi8@cluster0.y3a3lqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    }).catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// User Schema with Validation
const userSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        unique: true,
        required: [true, 'يجب توفير معرف المستخدم']
    },
    username: {
        type: String,
        required: [true, 'يجب توفير اسم المستخدم'],
        trim: true,
        maxLength: [16, 'يجب ألا يتجاوز اسم المستخدم 16 حرفاً']
    },
    email: {
        type: String,
        required: [true, 'يجب توفير البريد الإلكتروني'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'الرجاء إدخال بريد إلكتروني صحيح']
    },
    password: {
        type: String,
        required: [true, 'يجب توفير كلمة المرور'],
        minLength: [6, 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل']
    },
    grade: {
        type: String,
        required: [true, 'يجب تحديد الصف الدراسي']
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    isBanned: { 
        type: Boolean, 
        default: false 
    }
});

// Course Schema with Validation
const courseSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        unique: true,
        required: [true, 'يجب توفير معرف الكورس']
    },
    title: {
        type: String,
        required: [true, 'يجب توفير عنوان الكورس'],
        trim: true
    },
    videoURL: String,
    videos: [{
        id: String,
        title: String,
        url: String,
        addedDate: String
    }],
    activities: [{
        id: String,
        title: String,
        description: String,
        filePath: String,
        addedDate: String
    }],
    exams: [{
        id: String,
        title: String,
        googleFormUrl: String,
        addedDate: String
    }],
    grade: {
        type: String,
        required: [true, 'يجب تحديد الصف الدراسي']
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'يجب أن يكون السعر 0 أو أكثر']
    },
    imageURL: String,
    addedDate: String
});

// Grade Schema with Validation
const gradeSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        unique: true,
        required: [true, 'يجب توفير معرف الصف']
    },
    name: {
        type: String,
        required: [true, 'يجب توفير اسم الصف'],
        unique: true,
        trim: true
    }
});

// ActivationCode Schema with Validation
const activationCodeSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        unique: true,
        required: [true, 'يجب توفير معرف كود التفعيل']
    },
    code: {
        type: String,
        required: [true, 'يجب توفير كود التفعيل'],
        unique: true
    },
    gradeId: {
        type: Number,
        required: [true, 'يجب تحديد الصف الدراسي']
    },
    courseIds: {
        type: [Number],
        required: [true, 'يجب تحديد الكورس/الكورسات']
    },
    creationDate: String,
    createdBy: Number,
    usedBy: Number,
    usageDate: String,
    isDisabled: Boolean,
    disabledBy: Number,
    disabledDate: String,
    enabledBy: Number,
    enabledDate: String
});

// Subscription Schema with Validation
const subscriptionSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        unique: true,
        required: [true, 'يجب توفير معرف الاشتراك']
    },
    userId: {
        type: Number,
        required: [true, 'يجب تحديد المستخدم']
    },
    courseIds: {
        type: [Number],
        required: [true, 'يجب تحديد الكورس/الكورسات']
    },
    gradeId: {
        type: Number,
        required: [true, 'يجب تحديد الصف الدراسي']
    },
    activationCodeId: {
        type: Number,
        required: [true, 'يجب تحديد كود التفعيل']
    },
    startDate: String,
    isExpired: {
        type: Boolean,
        default: false
    }
});

// Notification Schema with Validation
const notificationSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        unique: true,
        required: [true, 'يجب توفير معرف الإشعار']
    },
    title: {
        type: String,
        required: [true, 'يجب توفير عنوان الإشعار'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'يجب توفير محتوى الإشعار'],
        trim: true
    },
    grade: {
        type: String,
        required: [true, 'يجب تحديد الصف الدراسي']
    }
});

// تحديد الإندكسات للبحث السريع
userSchema.index({ email: 1 });
courseSchema.index({ grade: 1 });
gradeSchema.index({ name: 1 });
activationCodeSchema.index({ code: 1 });
subscriptionSchema.index({ userId: 1, courseIds: 1 });

// تصدير النماذج
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Grade = mongoose.model('Grade', gradeSchema);
const ActivationCode = mongoose.model('ActivationCode', activationCodeSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
    User,
    Course,
    Grade,
    ActivationCode,
    Subscription,
    Notification
};