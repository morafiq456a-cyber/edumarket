const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    section: { type: String, default: 'القسم الأول' },
    videoUrl: { type: String, default: '' },
    videoPublicId: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
    isFreePreview: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);