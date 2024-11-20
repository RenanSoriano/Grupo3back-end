const usuario = require("../models/usuario");
const { check, validationResult } = require("express-validator");
const jwtToken = require('jsonwebtoken');
const { expressjwt: jwt } = require("express-jwt");

// SIGNUP
exports.signup = (req, res) => {
    // Validate usuario input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }

// Creating a new usuario instance and saving it to the database
const usuario = new usuario(req.body);
usuario.save()
    .then(usuario => {
        res.json({
            id: usuario._id,
            name: usuario.name,
            email: usuario.email,
            cpf: usuario.cpf,
        });
    })
    .catch(err => {
        let errorMessage = 'Something went wrong.';
        if (err.code === 11000) {
            errorMessage = 'usuario already exists, please signin'; 
        }
        return res.status(500).json({ error: errorMessage });
    });
};

// SIGNIN: Autenticar  usuario
exports.signin = async (req, res) => {
    // Validate usuario input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }

    // Checking usuario credentials and generating JWT token for authentication
    const { emailOrCpf, password } = req.body;
    await usuario.findOne({ $or: [{ email: emailOrCpf }, { cpf: emailOrCpf }] })
        .then(usuario => {
            if (!usuario) {
                return res.status(400).json({
                    error: "usuario not found"
                });
            }
            if (!usuario.authenticate(password)) {
                return res.status(401).json({
                    error: "Email or Password does not exist"
                });
            }
            // Setting JWT token as a cookie in the browser (cpf aqui)
            const token = jwtToken.sign({ _id: usuario._id }, 'shhhhh');
            res.cookie("token", token, { expire: new Date() + 9999 });
            const { _id, name, email, cpf } = usuario;
            return res.json({ token, usuario: { _id, name, email, cpf } });
        });
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