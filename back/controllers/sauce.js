const Sauce = require('../models/Sauce');
const fs = require('fs');
const { defaultMaxListeners } = require('events');

exports.createSauce = (req, res, next) => { 
    console.log(req.body.sauce)
    const sauceObject = JSON.parse(req.body.sauce); // Parse the request body to JSON
    
    delete sauceObject._id;
    delete sauceObject._userId; // Delete the user id from the request body to avoid any conflict with the user id in the database

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId, 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    console.log(sauce);

    sauce.save() // Save the sauce in the database
    .then(() => {res.status(201).json({ message: 'Sauce enregistrée !' })}) // 201: Created
    .catch(error => {res.status(400).json({ error })}); // 400: Bad Request
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? { 
        ...JSON.parse(req.body.sauce), 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : {
        ...req.body 
    }

    delete sauceObject._id; 

    console.log(req.auth.id)
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        console.log(`sauce created by : ${sauce.userId} | sauce modified by : ${req.auth.userId}`)

        const oldImageUrl = sauce.imageUrl.split('/images/')[1];

        switch (sauce.userId === req.auth.userId) {
            case true && !req.file:
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({ message: 'Sauce Modifiée !' }))
                .catch(error => res.status(401).json({ error }))
                break;
            case true && req.file && oldImageUrl !== req.file.filename:
                fs.unlink(`images/${oldImageUrl}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Sauce Modifiée !' }))
                    .catch(error => res.status(401).json({ error }))
                })
                break;
            default:
                res.status(401).json({ message: 'Not authorized' });
                break;
        }
    })
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({ message: 'Not authorized' });
        }
        else {
            const filename = sauce.imageUrl.split('/images/')[1];

            fs.unlink(`images/${filename}`, () => { 
                Sauce.deleteOne({ _id: req.params.id }) 
                .then(() => res.status(200).json({ message: 'Sauce Supprimée !' })) // 
                .catch(error => res.status(400).json({ error }));
            });
        }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne(
        { _id: req.params.id } // Find the sauce with the id in the request parameters
    )
    .then(sauce => res.status(200).json(sauce)) // 200: OK
    .catch(error => res.status(404).json({ error })); // 404: Not Found
};

exports.getAllSauces = (req, res, next) => { 
    Sauce.find() // Find all the sauces in the database
    .then(sauce => res.status(200).json(sauce)) // 200: OK
    .catch(error => res.status(400).json({ error })); // 400: Bad Request
    console.log(`User viewing all sauces: ${req.auth.userId}`);
};

exports.likeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;
    console.log(req.body)

    switch (like) {
        case 1: 
            Sauce.updateOne({ _id: sauceId}, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
            .then(() => res.status(200).json({ message: 'Added like.'}))
            .catch(error => res.status(400).json({ error }));
            break;
        case -1:
            Sauce.updateOne({ _id: sauceId}, { $inc: { dislikes: 1}, $push: { usersDisliked: userId }})
            .then(() => res.status(200).json({ message: 'Added dislike.'}))
            .catch(error => res.status(400).json({ error }));
            break;
        case 0:
            Sauce.findOne({ _id: sauceId })
            .then(sauce => {
                if(sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId }})
                    .then(() => res.status(200).json({ message: 'Removed like.'}))
                    .catch(error => res.status(400).json({ error }));
                }
                else if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId }})
                    .then(() => res.status(200).json({ message: 'Removed dislike.'}))
                    .catch(error => res.status(400).json({ error }));
                }
            });
            break;
        default:
            console.error('Bad request');
    }
};