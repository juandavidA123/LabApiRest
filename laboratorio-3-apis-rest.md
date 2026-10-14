# INGENIERÍA DE SISTEMAS Y TELECOMUNICACIONES
## LABORATORIO #3 CLOUD COMPUTING
### CONSTRUCCIÓN Y CONSUMO DE APIsREST

En este Laboratorio #3 sobre APIsREST con Docker desarrollarán un sistema de tareas (To-Do List) donde configurarán un backend que expone endpoints REST (GET, POST, DELETE) en formato JSON, y un frontend dinámico que los consuma.

---

## El Backend: Servidor API REST

Creen una carpeta llamada `api-backend`. Dentro de ella, añadan dos archivos:

### `api-backend/server.js`

*El siguiente código configura las rutas REST básicas*

```javascript
const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json()); // Habilita la lectura de JSON en el cuerpo (body) de las peticiones

// Simulación de Base de Datos en memoria
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

// [DELETE] Eliminar una tarea específica mediante su ID en la URL
app.delete('/api/tareas/:id', (req, res) => {
  const idEliminar = parseInt(req.params.id);
  tareas = tareas.filter(t => t.id !== idEliminar);
  res.json({ mensaje: "Tarea eliminada correctamente" });
});

app.listen(PORT, () => console.log(`API REST corriendo en el puerto ${PORT}`));
```

### `api-backend/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
RUN npm install express
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## El Frontend (HTML Nativo)

Deben crear una carpeta llamada `app-frontend`, y para este caso, usaremos un servidor web Nginx ultraligero que nos servirá como una página HTML con JavaScript para consumir la API de forma asíncrona con la función `fetch()`.

### `app-frontend/index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Gestor de Tareas API REST</title>
  <style>body { font-family: Arial, sans-serif; margin: 40px; background: #f4f7f6; color: #333; }</style>
</head>
<body>
  <h1>Mi Gestor de Tareas (Consumiendo API REST)</h1>

  <input type="text" id="inputTarea" placeholder="Escribe una nueva tarea...">
  <button onclick="agregarTarea()">Agregar Tarea</button>

  <ul id="listaTareas"></ul>

  <script>
    // Apuntamos al puerto expuesto de nuestra API
    const API_URL = 'http://localhost:5000/api/tareas';

    // 1. CONSUMIR [GET]
    async function cargarTareas() {
      const respuesta = await fetch(API_URL);
      const tareas = await respuesta.json();
      const lista = document.getElementById('listaTareas');
      lista.innerHTML = '';

      tareas.forEach(t => {
        lista.innerHTML += `<li>${t.texto} <button onclick="eliminarTarea(${t.id})">❌</button></li>`;
      });
    }

    // 2. CONSUMIR [POST]
    async function agregarTarea() {
      const input = document.getElementById('inputTarea');
      if (!input.value) return;

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: input.value })
      });

      input.value = '';
      cargarTareas(); // Refrescar la vista
    }

    // 3. CONSUMIR [DELETE]
    async function eliminarTarea(id) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      cargarTareas(); // Refrescar la vista
    }

    // Carga inicial
    cargarTareas();
  </script>
</body>
</html>
```

### `app-frontend/Dockerfile`

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
```

---

## Orquestación con Docker Compose

En la carpeta raíz del proyecto, debemos crear el archivo que unirá ambos componentes. Ya se ha utilizado esta arquitectura en anteriores laboratorios, con la única diferencia de que aquí sí exponemos el puerto del backend `5000:5000` hacia el exterior, porque es el usuario final el que ejecutará el código JavaScript para comunicarse con la API.

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  mi-api-backend:
    build: ./api-backend
    ports:
      - "5000:5000"

  mi-web-frontend:
    build: ./app-frontend
    ports:
      - "8082:80"
    depends_on:
      - mi-api-backend
```

---

## Despliegue

En la terminal, parados en la carpeta raíz donde está el archivo `docker-compose.yml`, ejecuten el siguiente comando:

```bash
docker compose up --build
```

---

## Verificación y Pruebas

1. Abran el navegador web e ingresen a: <http://localhost:8082>
2. Añadan tareas y elimínenlas usando las ❌. Verán en la consola de Docker Compose cómo se registran en vivo las peticiones: GET, POST, DELETE.

---

## Reto Calificable

1. Implementar un botón en el Frontend que diga **"Vaciar Lista de Tareas"** y configurar en el Backend un método HTTP DELETE global (ej: un endpoint `/api/tareas/limpiar`) o un bucle que vacíe por completo el arreglo `tareas = []` al presionarlo.

---

## Entregables

1. **Captura de pantalla de la Interfaz Web interactuando con la API:** Una imagen del navegador en <http://localhost:8082> donde se vea la lista con al menos 3 tareas creadas. Una de las tareas debe llevar obligatoriamente el Nombre del estudiante (ej: "Tarea 3: Revisar código de [Nombre del Alumno]").

2. **Captura de la Terminal con el registro de logs de las peticiones REST:** Una captura de la consola donde se vea claramente el flujo de Docker Compose procesando los diferentes métodos HTTP al hacer clic en los botones. En la pantalla se deben identificar las líneas que marcan los métodos ejecutados:
   - `GET /api/tareas`
   - `POST /api/tareas`
   - `DELETE /api/tareas/...`

3. **Bloque de código del Reto Autónomo:** El fragmento de código exacto en texto o captura que añadieron en el backend (`api-backend/server.js`) para manejar la eliminación total, junto con la función JavaScript correspondiente que añadieron en el archivo `index.html` para disparar esa acción.

4. **URL git del proyecto** (ej: <https://github.com/jorgebanol/APIsREST>)

---

## Reto adicional (5 décimas adicionales para la nota del proyecto final)

1. Modifiquen el backend para que se conecte a una base de datos real (como MongoDB o PostgreSQL) en lugar de usar la memoria RAM.
