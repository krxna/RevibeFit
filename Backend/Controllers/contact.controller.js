import Contact from '../models/contact.model.js';

// Submit contact form
export const submitContact = async (req, res) => {
    try {
        const { fullName, email, phone, message } = req.body;
        const contact = new Contact({
            fullName,
            email,
            phone,
            message
        });
        
        await contact.save();
        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all queries
export const getAllQueries = async (req, res) => {
    try {
        const contacts = await Contact.find().sort('-createdAt');
        res.status(200).json({
            success: true,
            contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contact submissions',
            error: error.message
        });
    }
};

// Add this new function
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { status: 'read' },
            { new: true }
        );

        if (!updatedContact) {
            return res.status(404).json({
                success: false,
                message: 'Contact query not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Marked as read successfully',
            contact: updatedContact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking as read',
            error: error.message
        });
    }
};