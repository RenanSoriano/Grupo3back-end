const express = require("express");
const router = express.Router();
//const { check } = require('express-validator');
const { signin, signup, signout, isSignedIn } = require("../models/authController");
const { check, oneOf, validationResult } = require('express-validator');


// Função auxiliar para validar CPF
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;

    // Segundo dígito verificador
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf[10]);
}

// POST request for user signup
router.post(
    "/signup",
    [
        // Validation for name, email, and password
        check("name", "Name must be 3+ chars long").isLength({ min: 3 }),
        check("email", "Email is required").isEmail(),
        check("cpf", "CPF is required").custom((cpf) => {
            if (!isValidCPF(cpf)) {
                throw new Error('CPF inválido.');
            }
            return true;
        }),
        check("password", "Password must contain 8+ chars").isLength({ min: 8 }),
       
    ],
    signup // Call the signup function from the authController
);

// POST request for user signin
router.post(
    "/signin",
    [
        // Validation for email and password
        //check("email", "Email is required").isEmail(),
        oneOf([
            check('cpf')
                .notEmpty().withMessage('O CPF é obrigatório.')
                .custom((cpf) => {
                    if (!isValidCPF(cpf)) {
                        throw new Error('CPF inválido.');
                    }
                    return true;
                }),
            check('email')
                .notEmpty().withMessage('O email é obrigatório.')
                .isEmail().withMessage('Email inválido.')
        ], 'É necessário informar pelo menos um CPF válido ou um email válido.'),
        check("password", "Password is required").isLength({ min: 1 }),
        
    ],
    signin // Call the signin function from the authController
);

// GET request for user signout
router.get("/signout", signout);
// Protected Route for testing
router.get("/testroute", isSignedIn, (req, res) => {
    res.send("A protected route");
});
module.exports = router;

