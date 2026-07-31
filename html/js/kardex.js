(function () {
	"use strict";

	// ===================== DATOS DE EJEMPLO =====================
	const proveedor = { nombre: "Lucas CBN" };

	let kardex = [
		{ n: 1, fecha: "31/07/2026", tipo: "COMPRA", detalle: "Cerveza Lata 350ml", debe: 220, haber: 0 },
		{ n: 2, fecha: "31/07/2026", tipo: "COMPRA", detalle: "Pollo", debe: 132, haber: 0 },
		{ n: 3, fecha: "31/07/2026", tipo: "COMPRA", detalle: "Cerveza", debe: 1270.50, haber: 0 },
		{ n: 4, fecha: "31/07/2026", tipo: "CUOTA", detalle: "Amortización", debe: 0, haber: 1270.50 },
		{ n: 5, fecha: "31/07/2026", tipo: "COMPRA", detalle: "Cerveza", debe: 82.50, haber: 0 },
	];

	const metodosPago = [
		{
			moneda: "Boliviano",
			metodos: [
				{ nombre: "Caja Principal", simbolo: "Bs", icon: "bi-cash-stack" },
				{ nombre: "Caja Secundaria", simbolo: "Bs", icon: "bi-wallet2" },
			],
		},
		{
			moneda: "Guaraní",
			metodos: [
				{ nombre: "Caja Guaraní", simbolo: "Gs", icon: "bi-cash-stack" },
				{ nombre: "Banco Familiar", simbolo: "Gs", icon: "bi-bank" },
				{ nombre: "Banco Itaú", simbolo: "Gs", icon: "bi-bank2" },
			],
		},
		{
			moneda: "Dólar",
			metodos: [
				{ nombre: "Caja Dólares", simbolo: "$us", icon: "bi-cash-stack" },
				{ nombre: "Payoneer", simbolo: "$us", icon: "bi-credit-card-2-front" },
			],
		},
		{
			moneda: "Euro",
			metodos: [
				{ nombre: "Caja Euros", simbolo: "€", icon: "bi-cash-stack" },
			],
		},
	];

	// ===================== ESTADO =====================
	let saldoActual = 0;
	let montoAmortizar = 0;
	let metodoSeleccionado = null;

	// ===================== HELPERS =====================
	function formatMoney(value) {
		const n = Number(value) || 0;
		return "Gs " + n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function tipoBadgeClass(tipo) {
		if (tipo === "COMPRA") return "badge-compra";
		if (tipo === "CUOTA") return "badge-cuota";
		return "badge-saldo";
	}

	// ===================== RENDER TABLA =====================
	function renderTabla() {
		const tbody = document.getElementById("kardexBody");
		tbody.innerHTML = "";

		let saldo = 0;
		let totalDebe = 0;
		let totalHaber = 0;

		kardex.forEach((row, idx) => {
			saldo += (row.debe || 0) - (row.haber || 0);
			totalDebe += row.debe || 0;
			totalHaber += row.haber || 0;
			row.saldoCalculado = saldo;

			const tr = document.createElement("tr");
			tr.innerHTML = `
				<td class="text-center">${idx + 1}</td>
				<td>${row.fecha}</td>
				<td><span class="badge-tipo ${tipoBadgeClass(row.tipo)}">${row.tipo}</span></td>
				<td>${row.detalle}</td>
				<td class="text-end">${row.debe ? formatMoney(row.debe) : ""}</td>
				<td class="text-end">${row.haber ? formatMoney(row.haber) : ""}</td>
				<td class="text-end fw-semibold">${formatMoney(saldo)}</td>
			`;
			tbody.appendChild(tr);
		});

		saldoActual = saldo;

		document.getElementById("totalDebe").textContent = formatMoney(totalDebe);
		document.getElementById("totalHaber").textContent = formatMoney(totalHaber);
		document.getElementById("saldoFinal").textContent = formatMoney(saldo);

		const btnAmortizar = document.getElementById("btnAmortizar");
		btnAmortizar.style.display = saldo > 0 ? "inline-flex" : "none";
	}

	// ===================== RENDER MÉTODOS DE PAGO =====================
	function renderMetodosPago() {
		const container = document.getElementById("metodosPagoContainer");
		container.innerHTML = "";
		metodoSeleccionado = null;
		document.getElementById("btnAceptarPago").disabled = true;

		metodosPago.forEach((grupo) => {
			const titulo = document.createElement("div");
			titulo.className = "grupo-moneda-title";
			titulo.textContent = grupo.moneda;
			container.appendChild(titulo);

			const row = document.createElement("div");
			row.className = "row g-3 mb-2";

			grupo.metodos.forEach((metodo) => {
				const col = document.createElement("div");
				col.className = "col-12 col-sm-6 col-md-4";

				const card = document.createElement("div");
				card.className = "metodo-pago-card";
				card.dataset.nombre = metodo.nombre;
				card.dataset.moneda = grupo.moneda;
				card.innerHTML = `
					<div class="metodo-pago-icon"><i class="bi ${metodo.icon}"></i></div>
					<div>
						<div class="metodo-pago-nombre">${metodo.nombre}</div>
						<div class="metodo-pago-moneda">${grupo.moneda} (${metodo.simbolo})</div>
					</div>
					<i class="bi bi-check-circle-fill metodo-check"></i>
				`;

				card.addEventListener("click", () => {
					document.querySelectorAll(".metodo-pago-card").forEach((c) => c.classList.remove("seleccionado"));
					card.classList.add("seleccionado");
					metodoSeleccionado = { nombre: metodo.nombre, moneda: grupo.moneda, simbolo: metodo.simbolo };
					document.getElementById("btnAceptarPago").disabled = false;
				});

				col.appendChild(card);
				row.appendChild(col);
			});

			container.appendChild(row);
		});
	}

	// ===================== TOAST =====================
	function mostrarToastExito() {
		const toastEl = document.getElementById("toastExito");
		const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
		toast.show();
	}

	// ===================== EVENTOS =====================
	document.addEventListener("DOMContentLoaded", () => {
		document.getElementById("nombreProveedor").textContent = proveedor.nombre;
		renderTabla();

		const inputFecha = document.getElementById("inputFecha");
		const btnFiltrar = document.getElementById("btnFiltrar");
		const inputMontoPagar = document.getElementById("inputMontoPagar");
		const errorMonto = document.getElementById("errorMonto");
		const btnConfirmarMonto = document.getElementById("btnConfirmarMonto");
		const btnAceptarPago = document.getElementById("btnAceptarPago");
		const modalAmortizarEl = document.getElementById("modalAmortizar");
		const modalTipoPagoEl = document.getElementById("modalTipoPago");
		const modalAmortizar = new bootstrap.Modal(modalAmortizarEl);
		const modalTipoPago = new bootstrap.Modal(modalTipoPagoEl);

		// Filtrar (demo: solo re-renderiza la tabla actual)
		btnFiltrar.addEventListener("click", () => {
			renderTabla();
		});

		// Al abrir modal Amortizar, refrescar saldo pendiente
		modalAmortizarEl.addEventListener("show.bs.modal", () => {
			document.getElementById("saldoPendienteLabel").textContent = formatMoney(saldoActual);
			inputMontoPagar.value = "";
			errorMonto.classList.add("d-none");
		});

		// Confirmar monto -> validar -> abrir modal 2
		btnConfirmarMonto.addEventListener("click", () => {
			const monto = parseFloat(inputMontoPagar.value) || 0;

			if (monto <= 0) {
				errorMonto.querySelector("span").textContent = "Ingresa un monto válido mayor a 0.";
				errorMonto.classList.remove("d-none");
				return;
			}

			if (monto > saldoActual) {
				errorMonto.querySelector("span").textContent = "El monto no puede ser mayor al saldo pendiente.";
				errorMonto.classList.remove("d-none");
				return;
			}

			errorMonto.classList.add("d-none");
			montoAmortizar = monto;

			document.getElementById("resumenSaldo").textContent = formatMoney(saldoActual);
			document.getElementById("resumenMonto").textContent = formatMoney(montoAmortizar);

			renderMetodosPago();

			modalAmortizar.hide();
			modalTipoPago.show();
		});

		// Aceptar pago -> confirmar amortización
		btnAceptarPago.addEventListener("click", () => {
			if (!metodoSeleccionado) return;

			const nuevoSaldo = saldoActual - montoAmortizar;

			kardex.push({
				n: kardex.length + 1,
				fecha: new Date().toLocaleDateString("es-BO"),
				tipo: "CUOTA",
				detalle: `Amortización de deuda (${metodoSeleccionado.nombre})`,
				debe: 0,
				haber: montoAmortizar,
			});

			renderTabla();

			modalTipoPago.hide();
			mostrarToastExito();

			montoAmortizar = 0;
			metodoSeleccionado = null;
		});
	});
})();
