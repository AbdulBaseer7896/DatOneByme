// routes/whitelistedDomain.js

const express = require('express');
const router = express.Router();
const whitelistedDomainController = require('../controllers/whitelistedDomainController');

// Route to create a new whitelisted domain
router.post('/', whitelistedDomainController.createDomain);

// Route to get all whitelisted domains
router.get('/', whitelistedDomainController.getDomains);

// Route to update a whitelisted domain by ID
router.put('/:id', whitelistedDomainController.updateDomain);

// Route to delete a whitelisted domain by ID
router.delete('/:id', whitelistedDomainController.deleteDomain);

module.exports = router;
