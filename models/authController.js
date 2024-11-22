const usuario = require("../models/usuario");
const { check, validationResult } = require("express-validator");
const jwtToken = require('jsonwebtoken');
const { expressjwt: jwt } = require("express-jwt");

// SIGNUP
exports.signup = async (req, res) => {
    // Validate usuario input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }

    const { name, email, cpf, password, birthDate } = req.body;
    // Creating a new usuario instance and saving it to the database
    const newUser = new usuario({ name, email, cpf, password });
    await newUser.save();
    res.json(newUser);
};

// SIGNIN: Autenticar  usuario
exports.signin = async (req, res) => {
    try {
        const { emailOrCpf, password } = req.body;
        
        const user = await usuario.findOne({
            $or: [
                { email: emailOrCpf },
                { cpf: emailOrCpf }
            ]
        });

        if (!user) {
            return res.status(400).json({
                error: "Usuario not found"
            });
        }

        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email/CPF or Password does not match"
            });
        }

        const token = jwtToken.sign({ _id: user._id }, 'shhhhh', { expiresIn: '1h' });
        res.cookie("token", token, { expire: new Date(Date.now() + 3600000) });
        
        const { _id, name, email, cpf } = user;
        return res.json({ token, usuario: { _id, name, email, cpf } });
    } catch (error) {
        console.error('Signin error:', error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};
// SIGNOUT: Clearing user token
exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User has signed out"
    });
};

// Protected Routes
exports.isSignedIn = jwt({
    secret: 'shhhhh',
    userProperty: "auth",
    algorithms: ['HS256']
});
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED"
        });
    }
    next();
};
//