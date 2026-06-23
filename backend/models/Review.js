const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ student: 1, course: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function(courseId) {
    const stats = await this.aggregate([
        { $match: { course: courseId, isApproved: true } },
        {
            $group: {
                _id: '$course',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Course').findByIdAndUpdate(courseId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].numReviews
        });
    }
};

reviewSchema.post('save', function() {
    this.constructor.calcAverageRating(this.course);
});

module.exports = mongoose.model('Review', reviewSchema);