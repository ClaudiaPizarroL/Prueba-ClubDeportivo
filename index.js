const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

app.use(express.json());

// Ruta raíz para HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Ruta para agregar nuevo deporte
app.get("/agregar", (req, res) => {
  const { nombre, precio } = req.query;

  if (!nombre || !precio || isNaN(parseFloat(precio))) {
    return res.status(400).json({
      error: "Debes ingresar un nombre y precio válidos para el deporte",
    });
  }

  const deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));

  //verifica que no se repita el nombre del deporte
  if (deportes.find((deporte) => deporte.nombre === nombre)) {
    return res.status(400).json({
      error: "Deporte con ese nombre ya existe",
    });
  }

  const nuevoDeporte = { nombre, precio: parseFloat(precio) };
  deportes.push(nuevoDeporte);

  fs.writeFileSync("deportes.json", JSON.stringify(deportes));

  res.json(nuevoDeporte);
});

// ruta que al consultarse devuelva en formato JSON todos los deportes registrados
app.get("/deportes", (req, res) => {
  const deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
  res.json({ deportes });
});

// Ruta para editar el precio de un deporte
app.get("/editar", (req, res) => {
  const { nombre, precio } = req.query;

  if (!nombre || !precio || isNaN(parseFloat(precio))) {
    return res.status(400).json({
      error: "Ingresa un nombre y precio válidos para editar",
    });
  }

  const deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
  const index = deportes.findIndex((deporte) => deporte.nombre === nombre);

  if (index === -1) {
    return res.status(404).json({
      error: "No se encontró ningún deporte con ese nombre",
    });
  }

  deportes[index].precio = parseFloat(precio);

  fs.writeFileSync("deportes.json", JSON.stringify(deportes));

  res.json({ mensaje: `El precio de ${nombre} se actualizó a ${precio}` });
});

// Ruta para eliminar un deporte
app.delete("/eliminar/:nombre", (req, res) => {
  const nombre = req.params.nombre;

  if (!nombre) {
    return res.status(400).json({
      error: "Ingresa el nombre del deporte a eliminar",
    });
  }

  const deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));
  const index = deportes.findIndex((deporte) => deporte.nombre === nombre);

  if (index === -1) {
    return res.status(404).json({
      error: `'${nombre}' no se encontró en la lista`,
    });
  }

  deportes.splice(index, 1);

  fs.writeFileSync("deportes.json", JSON.stringify(deportes));

  res.json({ mensaje: `'${nombre}' se eliminó correctamente` });
});



