/**
 * Task Controller
 * Handles task submission logic using MongoDB
 */
const Task = require('../models/Task');

/**
 * @desc    Submit a new task
 * @route   POST /api/tasks/submit
 * @access  Public
 */
exports.submitTask = async (req, res) => {
    try {
        const { internId, taskTitle, githubRepo, submissionLink } = req.body;

        // Basic validation
        if (!internId || !taskTitle || !githubRepo || !submissionLink) {
            return res.status(400).json({
                success: false,
                message: 'Please provide internId, taskTitle, githubRepo, and submissionLink'
            });
        }

        // Create new submission in DB
        const task = await Task.create({
            internId,
            taskTitle,
            githubRepo,
            submissionLink
        });

        res.status(201).json({
            success: true,
            message: 'Task submitted successfully',
            data: task
        });

    } catch (error) {
        console.error('Error in submitTask:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Get all task submissions
 * @route   GET /api/tasks
 * @access  Public
 */
exports.getSubmissions = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ submittedAt: -1 });
        
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Get submissions by Intern ID
 * @route   GET /api/tasks/intern/:internId
 */
exports.getInternSubmissions = async (req, res) => {
    try {
        const { internId } = req.params;
        const tasks = await Task.find({ internId }).sort({ submittedAt: -1 });
        
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
