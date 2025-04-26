const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    }).catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// User Schema
const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    username: String,
    email: String,
    password: String,
    grade: String,
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false }
});

// Course Schema
const courseSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    title: String,
    videoURL: String,
    videos: [mongoose.Schema.Types.Mixed],
    activities: [mongoose.Schema.Types.Mixed],
    exams: [mongoose.Schema.Types.Mixed],
    grade: String,
    price: Number,
    imageURL: String,
    addedDate: String
});

// Grade Schema
const gradeSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String
});

// ActivationCode Schema
const activationCodeSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    code: String,
    gradeId: Number,
    courseIds: [Number],
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

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    userId: Number,
    courseIds: [Number],
    gradeId: Number,
    activationCodeId: Number,
    startDate: String,
    isExpired: Boolean
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    title: String,
    content: String,
    grade: String
});

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