const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema({
    name: String,
    description: String,
    dueDate: Date,
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuario',
        required: true
    }
});

// Virtual field to check if the task is overdue
TarefaSchema.virtual('overdue').get(function() {
    if (!this.completed && this.dueDate) {
        return new Date() > this.dueDate;
    }
    return false;
});

module.exports = mongoose.model('tarefa', TarefaSchema);