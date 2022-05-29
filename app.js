const express = require('express');
const jwt = require ('jsonwebtoken');
const app = express();
const db = require('./config/db');
const User = require('./models/User');
const passport = require('passport');
const passportJWT = require('passport-jwt');


// JWT Configuration
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'secret';

let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
    let user = getUser({id: jwt_payload.id});
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

const getUser = async obj => {
    return await User.findOne({
        where: obj
    });
};

passport.use(strategy);

db.authenticate().then(() => console.log("DB connected")).catch(err => console.log(err)); // DB Connection

app.use(express.urlencoded({ extended: true }));



// ENDPOINT
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body;

        if (email && password) {
            let user = await getUser({email: email});
            if (!user) {
                res.status(401).json({message: "User not found"});
            }

            if (user.password === password) {
                let payload = {id: user.id};
                let token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({message: "200 oke", token: token});
            } else {
                res.status(401).json({message: "Password not match"});
            }
        }
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});

app.post('/register', async (req, res) => {
    try{
        const {email, password} = req.body;

        const newUser = new User({
            email,
            password
        });

        await newUser.save();

        res.json(newUser);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});

app.get(
    '/cobaakses',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        res.json({message: 'Success!'});
    }
)


// SERVER PORT
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});