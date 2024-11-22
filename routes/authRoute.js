const express = require("express");
const router = express.Router();
const { signin, signup, signout, isSignedIn } = require("../models/authController");
const { check, oneOf, validationResult } = require('express-validator');

// Função auxiliar para validar CPF
function isValidCPF(cpf) {
    if (!cpf) return false;
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf[10]);
}

// POST request for user signin
router.post(
    "/signin",
    [
        oneOf([
            check('emailOrCpf')
                .custom((value) => {
                    // Check if value is a valid CPF
                    if (isValidCPF(value)) return true;
                    // Check if value is a valid email
                    if (/^\S+@\S+\.\S+$/.test(value)) return true;
                    throw new Error('Informe um CPF ou email válido');
                })
        ]),
        check("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    },
    signin
);

// POST request for user signup
router.post(
    "/signup",
    [
        // Validation for name, email, CPF, password, and birth date
        check("name", "Name must be 3+ chars long").isLength({ min: 3 }),
        check("email", "Email is required").isEmail(),
        check("cpf", "CPF is required").custom((cpf) => {
            if (!isValidCPF(cpf)) {
                throw new Error('CPF inválido.');
            }
            return true;
        }),
        check("password", "Password must contain 8+ chars").isLength({ min: 8 }),
        check("birthDate", "Birth date is required and must be in YYYY-MM-DD format").isISO8601().toDate(),
    ],
    (req, res) => {
        // Handle the signup logic here
    }
);

module.exports = router;