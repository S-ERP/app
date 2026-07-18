#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

let texto = fs.readFileSync(archivo, "utf8");

texto = texto.replace(/\/\*[\s\S]*?\*\//g, "");

texto = texto.replace(
	/style=\{\{([\s\S]*?)\}\}/g,
	"style={{ $1 }}"
);

texto = texto.replace(
	/\.catch\s*\(\s*\(\)\s*=>\s*\{\s*/g,
	(match, offset) => {

		const antes = texto.substring(0, offset);

		const encontrado = antes.match(
			/([a-zA-Z_$][\w$]*)\s*\([^()]*\)\s*$/
		);

		const nombreFuncion = encontrado
			? encontrado[1]
			: "funcion_desconocida";

		return `.catch((e) => {\n    console.error("error en la funcion ${nombreFuncion} " + JSON.stringify(e));\n`;
	}
);

const lineas = texto.split(/\r?\n/);

let nivel = 0;
const salida = [];

for (let linea of lineas) {

	linea = linea.trim();

	linea = linea.replace(/\/\/.*$/, "").trim();

	if (linea === "") {
		continue;
	}

	if (linea.startsWith("}")) {
		nivel = Math.max(0, nivel - 1);
	}

	salida.push("    ".repeat(nivel) + linea);

	if (linea.endsWith("{")) {
		nivel++;
	}
}

fs.writeFileSync(
	archivo,
	salida.join("\n"),
	"utf8"
);

console.log("✅ Archivo limpiado correctamente:", archivo);