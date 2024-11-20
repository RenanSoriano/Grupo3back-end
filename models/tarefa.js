const mongoose = require('mongoose'); 


const TarefaSchema = new mongoose.Schema({ 
name: String,
description: String,
dueDate: Date,

 }); 


module.exports = mongoose.model('tarefa', TarefaSchema);
//