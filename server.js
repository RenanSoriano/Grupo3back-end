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

const app = express(); 


app.use(express.json()); 
app.use(cors());
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
app.get('/tarefas', async (req, res) => {
    const tarefas = await tarefa.find();
    res.json(tarefas);
});

app.post('/tarefas/new', async (req, res) => {
    const { name, description, dueDate } = req.body;
    const newTarefa = new tarefa({ name, description, dueDate });
    await newTarefa.save();
    res.json(newTarefa);
});

app.delete('/tarefas/delete/:id', async (req, res) => {
    const { id } = req.params;
    await tarefa.findByIdAndDelete(id);
    res.json({ message: 'Tarefa deleted' });
});

// Retrieve a single task by ID
app.get('/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    const tarefa = await Tarefa.findById(id);
    if (!tarefa) {
        return res.status(404).json({ message: 'Tarefa not found' });
    }
    res.json(tarefa);
});

// Update an existing task by ID
app.put('/tarefas/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, dueDate } = req.body;
    const updatedTarefa = await Tarefa.findByIdAndUpdate(id, { name, description, dueDate }, { new: true });
    if (!updatedTarefa) {
        return res.status(404).json({ message: 'Tarefa not found' });
    }
    res.json(updatedTarefa);
});
