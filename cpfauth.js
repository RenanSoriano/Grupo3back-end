const { check, oneOf, validationResult } = require('express-validator');

// Validações
const validateCpfOrEmail = [
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
    ], 'É necessário informar pelo menos um CPF válido ou um email válido.')
];

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

// Rota de exemplo
app.post('/api/validar', validateCpfOrEmail, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    res.json({ message: 'CPF ou email fornecido é válido!' });
});