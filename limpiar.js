#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Obtener ruta del archivo
const ruta = process.argv[2];

if (!ruta) {
    console.log("Uso: node limpiar.js archivo.js");
    process.exit(1);
}

const archivo = path.resolve(ruta);

if (!fs.existsSync(archivo)) {
    console.log("El archivo no existe.");
    process.exit(1);
}

if (fs.statSync(archivo).isDirectory()) {
    console.log("Debes indicar un archivo.");
    process.exit(1);
}

// Leer archivo
let texto = fs.readFileSync(archivo, "utf8");

// Eliminar comentarios de bloque /* ... */ y /** ... */
texto = texto.replace(/\/\*[\s\S]*?\*\//g, "");

// Separar en líneas
const lineas = texto.split(/\r?\n/);

let nivel = 0;
const salida = [];

for (let linea of lineas) {

    // Eliminar espacios y tabs al inicio y al final
    linea = linea.trim();

    // Eliminar comentarios de una línea
    linea = linea.replace(/\/\/.*$/, "").trim();

    // Omitir líneas vacías
    if (linea === "") {
        continue;
    }

    // Si la línea comienza con }, reducir indentación
    if (linea.startsWith("}")) {
        nivel = Math.max(0, nivel - 1);
    }

    // Agregar línea con indentación de 4 espacios
    salida.push("    ".repeat(nivel) + linea);

    // Si la línea termina con {, aumentar indentación
    if (linea.endsWith("{")) {
        nivel++;
    }
}

// Guardar archivo
fs.writeFileSync(archivo, salida.join("\n"), "utf8");

console.log("✅ Archivo limpiado correctamente:", archivo);