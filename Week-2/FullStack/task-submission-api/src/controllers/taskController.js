/**
 * Task Controller
 * Handles task submission logic
 */

// In-memory data store for submissions
let submissions = [];

/**
 * @desc    Submit a new task
 * @route   POST /api/tasks/submit
 * @access  Public
 */
exports.submitTask = (req, res) => {
    try {
        const { internId, taskTitle, githubRepo, submissionLink } = req.body;

        // Basic validation
        if (!internId || !taskTitle || !submissionLink) {
            return res.status(400).json({
                success: false,
                message: 'Please provide internId, taskTitle, and submissionLink'
            });
        }

        // Create new submission object
        const newSubmission = {
            id: submissions.length + 1,
            internId,
            taskTitle,
            githubRepo: githubRepo || 'N/A',
            submissionLink,
            submittedAt: new Date().toISOString(),
            status: 'Pending Review'
        };

        // Save submission
        submissions.push(newSubmission);

        res.status(201).json({
            success: true,
            message: 'Task submitted successfully',
            data: newSubmission
        });

    } catch (error) {
        console.error('Error in submitTask:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

/**
 * @desc    Get all task submissions
 * @route   GET /api/tasks
 * @access  Public
 */
exports.getSubmissions = (req, res) => {
    res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
    });
};

/**
 * @desc    Get submissions by Intern ID
 * @route   GET /api/tasks/intern/:internId
 */
exports.getInternSubmissions = (req, res) => {
    const { internId } = req.params;
    const filtered = submissions.filter(s => s.internId === internId);
    
    res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered
    });
};
