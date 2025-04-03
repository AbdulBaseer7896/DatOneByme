// controllers/whitelistedDomainController.js

const WhitelistedDomain = require('../models/WhitelistedDomain');

// Create a new whitelisted domain
exports.createDomain = async (req, res) => {
  const { domain } = req.body;

  try {
    const newDomain = new WhitelistedDomain({ domain });
    await newDomain.save();

    res.status(201).json({ message: 'Domain added to whitelist successfully', domain: newDomain });
  } catch (error) {
    console.error('Error adding domain to whitelist:', error.message);
    res.status(500).json({ error: 'Server error while adding domain to whitelist' });
  }
};

// Get all whitelisted domains
exports.getDomains = async (req, res) => {
  try {
    const domains = await WhitelistedDomain.find();
    res.status(200).json(domains);
  } catch (error) {
    console.error('Error fetching whitelisted domains:', error.message);
    res.status(500).json({ error: 'Server error while fetching whitelisted domains' });
  }
};

// Update a whitelisted domain by ID
exports.updateDomain = async (req, res) => {
  const { id } = req.params;
  const { domain } = req.body;

  try {
    const updatedDomain = await WhitelistedDomain.findByIdAndUpdate(
      id,
      { domain },
      { new: true, runValidators: true } // Returns the updated document
    );

    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.status(200).json({ message: 'Domain updated successfully', domain: updatedDomain });
  } catch (error) {
    console.error('Error updating domain:', error.message);
    res.status(500).json({ error: 'Server error while updating domain' });
  }
};

// Delete a whitelisted domain by ID
exports.deleteDomain = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDomain = await WhitelistedDomain.findByIdAndDelete(id);

    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.status(200).json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting domain:', error.message);
    res.status(500).json({ error: 'Server error while deleting domain' });
  }
};
