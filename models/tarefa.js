const mongoose = require('mongoose'); 


const tarefaSchema = new mongoose.Schema({ 
name: String,
description: String,
dueDate: Date,

 }); 


module.exports = mongoose.model('tarefa', tarefaSchema);