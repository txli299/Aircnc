const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Manager = require('../models/manager');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { UserExistsError } = require('passport-local-mongoose/lib/errors');
const User = require('../models/user')


router.get('/register',(req,res)=>{
    res.render('managers/register');
})
router.post('/register',catchAsync(async(req,res)=>{
    try{
        const {name,password} = req.body;
        const hash = await bcrypt.hash(password,12);
        const manager = new Manager({
            name,
            password:hash
        })
        await manager.save();
        res.redirect('/')
    }
    catch(e){
        res.send(e);
    }
}))


router.get('/login', (req, res) => {
    res.render('managers/login');
})

router.post('/login', catchAsync(async(req, res) => {
    try{
        const {name,password} = req.body;
        const manager = await Manager.findOne({name});
        if(!manager){
            req.flash('error', 'Try again!')
            res.redirect('/login');
        }else{
            const validPassword = await bcrypt.compare(password,manager.password)
            if(validPassword){
                req.session.manager_id = manager._id;
                req.flash('success', 'welcome!');
                const users = await User.find({})
                res.render('managers/control',{users});
            }else{
                req.flash('error','try again!');
                res.redirect('/login');
            }
            
        }
    }
    catch(e){
        res.send(e);
    }
}))

router.get('/control',async(req,res)=>{
    if(!req.session.manager_id){
        res.redirect('/login');
    }else{
        const users = await User.find({})
        res.render('managers/control',{users});
    }
})

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted housing')
    res.redirect('/manager/control');
}));

// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('success', "Goodbye!");
//     res.redirect('/campgrounds');
// })

module.exports = router;