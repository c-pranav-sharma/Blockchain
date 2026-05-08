const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    internId: {
        type: String,
        required: [true, 'Please add an intern ID']
    },
    taskTitle: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true
    },
    githubRepo: {
        type: String,
        required: [true, 'Please add a GitHub repository link']
    },
    submissionLink: {
        type: String,
        required: [true, 'Please add a submission/deployment link']
    },
    status: {
        type: String,
        enum: ['Pending Review', 'Approved', 'Rejected'],
        default: 'Pending Review'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
