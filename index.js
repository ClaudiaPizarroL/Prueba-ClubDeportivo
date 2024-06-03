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
    console.log("Faltan parámetros, se requiere nombre y precio");
    return res.send("Error. Debes ingresar un nombre y precio válido para el deporte");
    } 

  const deportes = JSON.parse(fs.readFileSync("deportes.json", "utf8"));

  //verifica que no se repita el nombre del deporte
  if (deportes.find((deporte) => deporte.nombre === nombre)) {
    return res.send("Deporte con ese nombre ya existe");
  }

  const nuevoDeporte = { nombre, precio: parseFloat(precio) };
  deportes.push(nuevoDeporte);

  fs.writeFileSync("deportes.json", JSON.stringify(deportes));
console.log("Nuevo Deporte objeto: ", nuevoDeporte);
  console.log("Arreglo Deportes: ", deportes);
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

 return res.send(`El precio se actualizó correctamente` );
});

// Ruta para eliminar un deporte

app.get("/eliminar/:nombre", (req, res) => {
  const nombre = req.params.nombre;

  console.log(`Solicitud para eliminar: ${nombre}`);

  if (!nombre) {
    console.log("Nombre no proporcionado");
    return res.status(400).json({
      error: "Ingresa el nombre del deporte a eliminar",
    });
  }

  let deportes;
  try {
    if (!fs.existsSync("deportes.json")) {
      console.log("Archivo deportes.json no existe");
      return res.status(404).json({
        error: "El archivo deportes.json no existe",
      });
    }

    const data = fs.readFileSync("deportes.json", "utf8");
    deportes = JSON.parse(data);

    if (!Array.isArray(deportes)) {
      console.log("El contenido de deportes.json no es un array");
      return res.status(500).json({
        error: "El archivo deportes.json no contiene un array válido",
      });
    }
  } catch (error) {
    console.log("Error al leer deportes.json", error);
    return res.status(500).json({
      error: "Error al leer el archivo deportes.json",
      details: error.message,
    });
  }

  const index = deportes.findIndex((deporte) => deporte.nombre === nombre);
  console.log(`Índice encontrado: ${index}`);

  if (index === -1) {
    console.log(`Deporte '${nombre}' no encontrado`);
    return res.status(404).json({
      error: `'${nombre}' no se encontró en la lista`,
    });
  }

  deportes.splice(index, 1);

  try {
    fs.writeFileSync("deportes.json", JSON.stringify(deportes, null, 2), "utf8");
    console.log(`Deporte '${nombre}' eliminado correctamente`);
  } catch (error) {
    console.log("Error al escribir deportes.json", error);
    return res.status(500).json({
      error: "Error al escribir en el archivo deportes.json",
      details: error.message,
    });
  }

  return res.send(`El deporte se eliminó correctamente` );
});


