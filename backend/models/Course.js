const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    thumbnail: { type: String, default: '' },
    previewVideo: { type: String, default: '' },
    language: { type: String, default: 'العربية' },
    level: {
        type: String,
        enum: ['مبتدئ', 'متوسط', 'متقدم', 'جميع المستويات'],
        default: 'جميع المستويات'
    },
    requirements: [{ type: String }],
    whatYouWillLearn: [{ type: String }],
    totalDuration: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'rejected'],
        default: 'draft'
    },
    rejectionReason: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false }
}, { timestamps: true });

courseSchema.pre('save', function(next) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-\u0600-\u06FF]+/g, '');
    if (this.price === 0) this.isFree = true;
    next();
});

module.exports = mongoose.model('Course', courseSchema);