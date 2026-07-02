const fs = require("fs");
const path = require("path");

// 📌 Tomar ruta desde terminal
const ruta = process.argv[2];

if (!ruta) {
    console.log("❌ Uso:");
    console.log("node limpiar.js ./src/Pages/archivo.js");
    process.exit(1);
}

// 📌 convertir a ruta real
const archivo = path.resolve(ruta);

// ❌ validar existencia
if (!fs.existsSync(archivo)) {
    console.log("❌ El archivo no existe:", archivo);
    process.exit(1);
}

// ❌ evitar carpetas
const stat = fs.statSync(archivo);

if (stat.isDirectory()) {
    console.log("❌ Eso es una carpeta, selecciona un archivo");
    process.exit(1);
}

// 📖 leer archivo
let texto = fs.readFileSync(archivo, "utf8");

// 🧼 reglas de limpieza
const reglas = [
    [/^\s+|\s+$/gm, ""],
    [/ {2,}/g, " "],
    [/\t/g, "    "],
    [/^\s*[\r\n]/gm, ""],
    [/(\r?\n){2,}/g, "\n\n"],

    [/\s+;/g, ";"],
    [/\s+,/g, ","],
    [/\s+\)/g, ")"],
    [/\(\s+/g, "("],
    [/\s+\]/g, "]"],
    [/\[\s+/g, "["],
    [/\s+\}/g, "}"],
    [/\{\s+/g, "{"],

    [/^\s*console\.log\(.*\);\s*$/gm, ""],
    [/^\s*debugger;\s*$/gm, ""],
    [/^\s*\/\/.*$/gm, ""],

    [/\s*=\s*/g, " = "],
    [/\s*\+\s*/g, " + "],
    [/,(\S)/g, ", $1"],
    [/\s+,/g, ","]
];

// 🔄 aplicar reglas
for (const [buscar, reemplazar] of reglas) {
    texto = texto.replace(buscar, reemplazar);
}

// 💾 guardar
fs.writeFileSync(archivo, texto, "utf8");

console.log("✅ Archivo limpiado correctamente:", archivo);