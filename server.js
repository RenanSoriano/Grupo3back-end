const express = require('express'); 
const cors = require('cors'); 
const mongoose = require('mongoose'); 
require('dotenv').config();
var crypto = require("crypto");
const {v4: uuidv4} =  require('uuid')
const cookieParser = require('cookie-parser');
const Authroute = require("./routes/authRoute")
const tarefa = require('./models/tarefa');
const usuario = require('./models/usuario');
const Tarefa = require('./models/tarefa');
const { isSignedIn } = require('./models/authController');

const app = express(); 


app.use(express.json()); 
// Cookie-parser for handling cookies
app.use(cookieParser());
// CORS for enabling Cross-Origin Resource Sharing
app.use(cors());
// Routing
// Mounting authentication-related routes under the '/api' endpoint
app.use("/api", Authroute);

const port = 4001;

app.listen(port, () => console.log(`Server is running on port ${port}`));

const connectionString = process.env.MONGO_URI; 
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to the database…')) 
        .catch((err) => console.error('Connection error:', err));



//Rotas
app.get('/tarefas', isSignedIn, async (req, res) => {
    try {
        const tarefas = await Tarefa.find();
        res.json(tarefas);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving tarefas', error });
    }
});

app.post('/tarefas/new',isSignedIn, async (req, res) => {
    const { name, description, dueDate } = req.body;
    const newTarefa = new tarefa({ name, description, dueDate });
    await newTarefa.save();
    res.json(newTarefa);
});

app.delete('/tarefas/delete/:id',isSignedIn, async (req, res) => {
    const { id } = req.params;
    await tarefa.findByIdAndDelete(id);
    res.json({ message: 'Tarefa deleted' });
});

// Retrieve a single task by ID
app.get('/tarefas/:id',isSignedIn, async (req, res) => {
    const { id } = req.params;
    const tarefa = await Tarefa.findById(id);
    if (!tarefa) {
        return res.status(404).json({ message: 'Tarefa not found' });
    }
    res.json(tarefa);
});

// Update an existing task by ID
app.put('/tarefas/update/:id',isSignedIn, async (req, res) => {
    const { id } = req.params;
    const { name, description, dueDate } = req.body;
    const updatedTarefa = await Tarefa.findByIdAndUpdate(id, { name, description, dueDate }, { new: true });
    if (!updatedTarefa) {
        return res.status(404).json({ message: 'Tarefa not found' });
    }
    res.json(updatedTarefa);
});

// Mark a task as done
app.put('/tarefas/:id/done', isSignedIn, async (req, res) => {
    const { id } = req.params;
    try {
        const updatedTarefa = await Tarefa.findByIdAndUpdate(id, { completed: true }, { new: true });
        if (!updatedTarefa) {
            return res.status(404).json({ message: 'Tarefa not found' });
        }
        res.json(updatedTarefa);
    } catch (error) {
        res.status(500).json({ message: 'Error marking tarefa as done', error });
    }
});

// Update user information
app.put('/usuario/update', isSignedIn, async (req, res) => {
    const { email, cpf, password, birthDate } = req.body;
    const userId = req.user._id; // Assuming user ID is stored in req.user

    const updateData = {};
    if (email) updateData.email = email;
    if (cpf) updateData.cpf = cpf;
    if (password) updateData.password = password;
    if (birthDate) updateData.birthDate = birthDate;

    try {
        const updatedUsuario = await usuario.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUsuario) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUsuario);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user information', error });
    }
});

// Delete user account
app.delete('/usuario/delete', isSignedIn, async (req, res) => {
    const userId = req.user._id; // Assuming user ID is stored in req.user

    try {
        const deletedUsuario = await usuario.findByIdAndDelete(userId);
        if (!deletedUsuario) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user account', error });
    }
});

// Retrieve user information
app.get('/usuario', isSignedIn, async (req, res) => {
    const userId = req.user._id; // Assuming user ID is stored in req.user

    try {
        const user = await usuario.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user information', error });
    }
});