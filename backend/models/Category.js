const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📚' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

categorySchema.pre('save', function(next) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    next();
});

module.exports = mongoose.model('Category', categorySchema);