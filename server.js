const express = require('express'); 
const cors = require('cors'); 
const mongoose = require('mongoose'); 
require('dotenv').config();
var crypto = require("crypto");
const {v4: uuidv4} =  require('uuid')
const app = express(); 

// a
app.use(express.json()); 
app.use(cors());

const port = 4001;

app.listen(port, () => console.log(`Server is running on port ${port}`));

const connectionString = process.env.MONGO_URI; 
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to the database…')) 
        .catch((err) => console.error('Connection error:', err));

const tarefa = require('./models/tarefa');

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


    
