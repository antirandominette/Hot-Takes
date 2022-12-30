const Sauce = require('../models/Sauce');
const fs = require('fs');

// List of HTTP status codes used in the code:

// 200 (OK) - Indicates that the request has succeeded and the server has returned the requested data.
// 201 (Created) - Indicates that the request has succeeded and the server has created a new document or resource.
// 400 (Bad Request) - Indicates that the request has failed due to syntax or validation error.
// 401 (Unauthorized) - Indicates that the request has failed because the user lacks the necessary permissions to access the requested resource.

exports.createSauce = (req, res, next) => {  // Create a sauce
    console.log(req.body.sauce)
    const sauceObject = JSON.parse(req.body.sauce); // Parse the request body to JSON
    
    delete sauceObject._id; // Delete the _id to preventit from being modified by user, it could be a security breach
    delete sauceObject._userId; // Delete the user id sent, it could be a security breach

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId, 
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    console.log(sauce);

    sauce.save() // Save the sauce in the database
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' })) 
        .catch(error => res.status(400).json({ error })); 
};

exports.modifySauce = (req, res, next) => { // Modify a sauce
  // Due to Multer configuration, if a file is uploaded the req.body is different from the req.body when no file is uploaded.
  const sauceObject = req.file ? { ...req.body.sauce, imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` } : { ...req.body } 

  console.table(sauceObject);

  delete sauceObject.userId; // Delete the user id from the request body to avoid any conflict with the user id in the database

  function updateWithoutImage() { // Update the sauce without changing the image
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Sauce Modifiée !' }))
        .catch(error => res.status(401).json({ error }))
  }

  function updateWithImage(oldImageUrl) { // Update the sauce and delete the old image and replace it with the new one
    fs.unlink(`images/${oldImageUrl}`, () => {
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
          .then(() => res.status(200).json({ message: 'Sauce Modifiée !' }))
          .catch(error => res.status(401).json({ error }))
    });
  }

  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const oldImageUrl = sauce.imageUrl.split('/images/')[1];

        switch (true) {
            case sauce.userId === req.auth.userId && !req.file: // user is the same that created sauce && no file in request
              updateWithoutImage();

              break;
            case sauce.userId === req.auth.userId && req.file && oldImageUrl !== req.file.filename: // user is the same that created sauce && file in request && old img !== new img
              updateWithImage(oldImageUrl);

              break;
            default:
              res.status(401).json({ message: 'Not authorized' });

              break;
        }
      })
      .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => { // Delete a sauce
  function deleteSauce(sauce) {
    const filename = sauce.imageUrl.split('/images/')[1];

    fs.unlink(`images/${filename}`, () => { 
      Sauce.deleteOne({ _id: req.params.id }) 
          .then(() => res.status(200).json({ message: 'Sauce Supprimée !' })) // 
          .catch(error => res.status(400).json({ error }));
    });
  } 

  Sauce.findOne({ _id: req.params.id }) 
      .then(sauce => { sauce.userId != req.auth.userId ? res.status(401).json({ message: 'Not authorized'}) :  deleteSauce(sauce) })
      .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => { // Get one sauce
    Sauce.findOne({ _id: req.params.id }) 
        .then(sauce => res.status(200).json(sauce)) 
        .catch(error => res.status(404).json({ error })); 
};

exports.getAllSauces = (req, res, next) => { // Get all sauces
    Sauce.find()
        .then(sauce => res.status(200).json(sauce)) // sauce = all the sauces in the database
        .catch(error => res.status(400).json({ error })); 

    console.log(`User currently viewing sauces: ${req.auth.userId}`);
};

exports.likeSauce = (req, res, next) => { // Like or dislike a sauce
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;
    console.log(req.body)

    // $inc = increment, $push = push, $pull = pull
    function addLike() {
        Sauce.updateOne({ _id: sauceId}, { $inc: { likes: 1 }, $push: { usersLiked: userId } }) 
            .then(() => res.status(200).json({ message: 'Added like.'}))
            .catch(error => res.status(400).json({ error }))
    }

    function addDislike() {
        Sauce.updateOne({ _id: sauceId}, { $inc: { dislikes: 1}, $push: { usersDisliked: userId }})
            .then(() => res.status(200).json({ message: 'Added dislike.'}))
            .catch(error => res.status(400).json({ error }));
    }

    function removeLike() {
        Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId }})
            .then(() => res.status(200).json({ message: 'Removed like.'}))
            .catch(error => res.status(400).json({ error }));
    }

    function removeDislike() {
        Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId }})
            .then(() => res.status(200).json({ message: 'Removed dislike.'}))
            .catch(error => res.status(400).json({ error }));
    }

    switch (like) { // like = 1, dislike = -1, remove like/dislike = 0
        case 1: 
            Sauce.findOne({ _id: sauceId })
                .then(sauce => {
                    (userId === req.auth.userId && !sauce.usersLiked.includes(userId) && !sauce.usersDisliked.includes(userId)) ? 
                        addLike() : res.status(401).json({ message: 'Not authorized' });
                })
                .catch(error => res.status(400).json({ error }));
            
            break;
        case -1:
            Sauce.findOne({ _id: sauceId })
                .then(sauce => {
                    (userId === req.auth.userId && !sauce.usersDisliked.includes(userId) && !sauce.usersLiked.includes(userId)) ?
                        addDislike() : res.status(401).json({ message: 'Not authorized' });
                })
                .catch(error => res.status(400).json({ error }));

            break;
        case 0:
            Sauce.findOne({ _id: sauceId })
                .then(sauce => {
                    switch (true) {
                        case (userId === req.auth.userId && sauce.usersLiked.includes(userId)):
                            removeLike();
                            
                            break;
                        case (userId === req.auth.userId && sauce.usersDisliked.includes(userId)):
                            removeDislike();
                            
                            break;
                        default:
                            res.status(401).json({ message: 'Not authorized' });
                    }
                });
            break;
        default:
            console.error('Bad request');
    }
};