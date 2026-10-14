const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

let tareas = [
    { id: 1, texto: "Aprender conceptos básicos de Docker" },
    { id: 2, texto: "Desplegar mi primer arquitectura de Microservicios" }
];

// [GET] Obtener la lista completa de tareas
app.get('/api/tareas', (req, res) => {
    res.json(tareas);
});

// [POST] Crear una nueva tarea
app.post('/api/tareas', (req, res) => {
    const nuevaTarea = { id: Date.now(), texto: req.body.texto };
    tareas.push(nuevaTarea);
    res.status(201).json(nuevaTarea);
});

// [DELETE] Vaciar la lista completa
app.delete('/api/tareas/vaciar', (req, res) => {
    tareas = [];
    res.json({ mensaje: "Lista de tareas vaciada correctamente" });
});

// [DELETE] Eliminar una tarea específica mediante su ID
app.delete('/api/tareas/:id', (req, res) => {
    const idEliminar = parseInt(req.params.id, 10);
    tareas = tareas.filter(t => t.id !== idEliminar);
    res.json({ mensaje: "Tarea eliminada correctamente" });
});

app.listen(PORT, () => {
    console.log(`API REST corriendo en el puerto ${PORT}`);
});