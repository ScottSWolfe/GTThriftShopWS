var authentication = require('../utils/authentication.utils');
var Message = require('../models/message.model');
var User = require('../models/user.model');
var Listing = require('../models/listing.model');


exports.findMessages = function (req, res) {
    var query = Message.find({
        $and: [
            {listing: req.params.listing_id},
            {$or: [{sendingUser: req.params.first_user_id}, {sendingUser: req.params.second_user_id}]},
            {$or: [{receivingUser: req.params.first_user_id}, {receivingUser: req.params.second_user_id}]},
            {$or: [{sendingUser: req.params.first_user_id}, {receivingUser: req.params.first_user_id}]}
        ]
    });
    query.populate('sendingUser').populate('receivingUser').populate('listing');
    query.sort([['createdAt', 'ascending']]);
    query.exec(function (err, messages) {
        if (err) {
            res.status(500).send({successful: false, text: err.message});
        } else {
            req.messages = messages;
            res.status(200).send(req.messages);
        }
    });
};

exports.findUsersInMessageThread = function (req, res) {
    var query = Message.find({
        $and: [
            {listing: req.params.listing_id},
            {$or: [{sendingUser: req.params.first_user_id}, {sendingUser: req.params.second_user_id}]},
            {$or: [{receivingUser: req.params.first_user_id}, {receivingUser: req.params.second_user_id}]},
            {$or: [{sendingUser: req.params.first_user_id}, {receivingUser: req.params.second_user_id}]}
        ]
    });
    query.populate('sendingUser').populate('receivingUser').populate('listing');
    query.sort([['createdAt', 'ascending']]);
    query.exec(function (err, messages) {
        if (err) {
            return res.status(500).send({successful: false, text: err.message});
        } else {
            req.messages = messages;
            return res.status(200).send(req.messages);
        }
    });
};

exports.validateListing = function (req, res, next) {
    if (!req.body.listing) {
        return res.status(400).send('Listing not given.');
    }
    Listing.findOne({_id: req.body.listing}, function(err, listing) {
        if (err) {
            return res.status(500).send(err.message);
        }
        else if (!listing) {
            return res.status(400).send('Could not find listing.');
        }
        else {
            next();
        }
    });
};

exports.setSendingUser = function (req, res, next) {
    var user = authentication.getUserFromToken(req);
    req.body.sendingUser = user._id;
    next();
};

exports.validateReceiver = function (req, res, next) {
    if (!req.body.receivingUser) {
        return res.status(400).send('Receiving user not given.');
    }
    User.findOne({_id: req.body.receivingUser}, function(err, user) {
        if (err) {
            return res.status(500).send(err.message);
        }
        else if (!user) {
            return res.status(400).send('Could not find receiving user.');
        }
        else {
            next();
        }
    });
};

exports.validateMessage = function (req, res, next) {
    if (!req.body.message || req.body.message === '') {
        return res.status(400).send('No message given.');
    }
    next();
};


exports.createMessage = function(req, res) {
    var newMessage = new Message({
        listing: req.body.listing,
        sendingUser: req.body.sendingUser,
        receivingUser: req.body.receivingUser,
        message: req.body.message
    });
    newMessage.save(function(err) {
        if (err) {
            res.status(500).send({successful: false, text: err.message});
        } else {
            res.status(201).send({successful: true, text:'Message Successfully Created'});
        }
    });
};