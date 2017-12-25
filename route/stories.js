const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('user');

const {
    ensureAuthenticated,
    ensureGuest
} = require('../helper/auth');

router.get('/', (req, res) => {
    Story.find({
        status: 'public'
    }).populate('user').then(stories => {
        res.render('stories/index', {
            stories: stories
        });

    })
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

// Process Add Story
router.post('/', (req, res) => {
    let allowComments;
    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    const newStory = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user.id
    }

    new Story(newStory)
        .save()
        .then(story => {
            res.redirect(`/stories/show/${story.id}`)
        })
})

router.get('/show/:id', (req,res) => {
    Story.findOne({
        _id: req.params.id
    }).populate('user').then(story => {
        res.render('stories/show',{story:story});
    })
});
module.exports = router;