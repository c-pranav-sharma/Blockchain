/**
 * Intern Controller
 * Handles registration logic for interns using MongoDB
 */
const Intern = require('../models/Intern');

/**
 * @desc    Register a new intern
 * @route   POST /api/interns/register
 * @access  Public
 */
exports.registerIntern = async (req, res) => {
    try {
        const { name, email, domain, walletAddress } = req.body;

        // Basic validation (Mongoose handles some, but we can do it here too)
        if (!name || !email || !domain) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and internship domain'
            });
        }

        // Check if intern already exists
        const existingIntern = await Intern.findOne({ email });
        if (existingIntern) {
            return res.status(400).json({
                success: false,
                message: 'Intern with this email already registered'
            });
        }

        // Create new intern in DB
        const intern = await Intern.create({
            name,
            email,
            domain,
            walletAddress: walletAddress || 'Not provided'
        });

        res.status(201).json({
            success: true,
            message: 'Intern registered successfully',
            data: intern
        });

    } catch (error) {
        console.error('Error in registerIntern:', error);
        
        // Handle Mongoose duplicate key error or validation errors
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc    Get all registered interns
 * @route   GET /api/interns
 * @access  Public
 */
exports.getInterns = async (req, res) => {
    try {
        const interns = await Intern.find().sort({ registrationDate: -1 });
        
        res.status(200).json({
            success: true,
            count: interns.length,
            data: interns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
