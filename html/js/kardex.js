(function () {
	"use strict";

	// ===================== DATOS DE EJEMPLO =====================
	const proveedor = { nombre: "Lucas CBN" };

	let nextRowId = 1;

	function crearFilaCompra({ fecha, detalle, debe, compraInfo }) {
		return {
			id: nextRowId++,
			fecha,
			tipo: "COMPRA",
			detalle,
			debe,
			haber: 0,
			compraInfo,
		};
	}

	function crearFilaCuota({ fecha, detalle, haber, metodoPago }) {
		return {
			id: nextRowId++,
			fecha,
			tipo: "CUOTA",
			detalle,
			debe: 0,
			haber,
			metodoPago,
		};
	}

	let kardex = [
		crearFilaCompra({
			fecha: "31/07/2026", detalle: "Cerveza Lata 350ml", debe: 220,
			compraInfo: { sucursal: "Sucursal Central", usuario: "Juan Pérez", almacen: "Almacén 1", producto: "Cerveza Lata 350ml", cantidad: 20, precioUnitario: 11.0 },
		}),
		crearFilaCompra({
			fecha: "31/07/2026", detalle: "Pollo", debe: 132,
			compraInfo: { sucursal: "Sucursal Central", usuario: "Juan Pérez", almacen: "Almacén 1", producto: "Pollo entero", cantidad: 12, precioUnitario: 11.0 },
		}),
		crearFilaCompra({
			fecha: "31/07/2026", detalle: "Cerveza", debe: 1270.50,
			compraInfo: { sucursal: "Sucursal Norte", usuario: "María López", almacen: "Almacén 2", producto: "Cerveza Caja x24", cantidad: 30, precioUnitario: 42.35 },
		}),
		crearFilaCuota({ fecha: "31/07/2026", detalle: "Amortización", haber: 1270.50, metodoPago: "Caja Principal" }),
		crearFilaCompra({
			fecha: "31/07/2026", detalle: "Cerveza", debe: 82.50,
			compraInfo: { sucursal: "Sucursal Central", usuario: "Juan Pérez", almacen: "Almacén 1", producto: "Cerveza Lata 350ml", cantidad: 7.5, precioUnitario: 11.0 },
		}),
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
	let idFilaPendienteAnular = null;

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

	function esUltimaFila(id) {
		return kardex.length > 0 && kardex[kardex.length - 1].id === id;
	}

	function esAmortizacionAnulable(row) {
		return row.tipo === "CUOTA" && Number(row.haber) > 0 && esUltimaFila(row.id);
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
				<td class="text-center">
					<button type="button" class="btn-fila-menu" data-row-id="${row.id}" aria-label="Acciones de la fila">
						<i class="bi bi-three-dots-vertical"></i>
					</button>
				</td>
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

	// ===================== MENÚ CONTEXTUAL DE FILA =====================
	function cerrarMenuFila() {
		const menu = document.getElementById("rowActionMenu");
		menu.classList.add("d-none");
		menu.innerHTML = "";
	}

	function itemMenuHtml({ icon, label, danger, disabled }) {
		const classes = ["menu-item"];
		if (danger) classes.push("item-danger");
		if (disabled) classes.push("item-disabled");
		return `<div class="${classes.join(" ")}"><i class="bi ${icon}"></i><span>${label}</span></div>`;
	}

	function abrirMenuFila(rowId, btnEl) {
		const row = kardex.find((r) => r.id === rowId);
		if (!row) return;

		const menu = document.getElementById("rowActionMenu");
		const partes = [];

		if (row.tipo === "COMPRA") {
			partes.push({ html: itemMenuHtml({ icon: "bi-receipt", label: "Ver detalle de compra" }), action: () => abrirDetalleCompra(row) });
		}

		if (row.tipo === "CUOTA") {
			const anulable = esAmortizacionAnulable(row);
			partes.push({
				html: itemMenuHtml({ icon: "bi-x-circle", label: "Anular amortización", danger: true, disabled: !anulable }),
				action: anulable ? () => abrirConfirmarAnular(row) : null,
				disabled: !anulable,
			});
		}

		menu.innerHTML = partes.length
			? partes.map((p) => p.html).join("")
			: `<div class="menu-empty">Sin acciones disponibles</div>`;

		const items = menu.querySelectorAll(".menu-item:not(.item-disabled)");
		items.forEach((el, i) => {
			el.addEventListener("click", () => {
				cerrarMenuFila();
				const accion = partes.filter((p) => !p.disabled)[i]?.action;
				if (accion) accion();
			});
		});

		menu.classList.remove("d-none");

		const rect = btnEl.getBoundingClientRect();
		const menuRect = menu.getBoundingClientRect();
		let top = rect.bottom + 6;
		let left = rect.right - menuRect.width;

		if (top + menuRect.height > window.innerHeight) {
			top = rect.top - menuRect.height - 6;
		}
		if (left < 8) left = 8;

		menu.style.top = `${top}px`;
		menu.style.left = `${left}px`;
	}

	// ===================== DETALLE DE COMPRA =====================
	function abrirDetalleCompra(row) {
		const info = row.compraInfo || {};
		const body = document.getElementById("detalleCompraBody");
		const total = (info.cantidad || 0) * (info.precioUnitario || 0);

		body.innerHTML = `
			<div class="detalle-compra-row"><span>Fecha</span><span>${row.fecha}</span></div>
			<div class="detalle-compra-row"><span>Producto</span><span>${info.producto || row.detalle}</span></div>
			<div class="detalle-compra-row"><span>Sucursal</span><span>${info.sucursal || "-"}</span></div>
			<div class="detalle-compra-row"><span>Almacén</span><span>${info.almacen || "-"}</span></div>
			<div class="detalle-compra-row"><span>Usuario</span><span>${info.usuario || "-"}</span></div>
			<div class="detalle-compra-row"><span>Cantidad</span><span>${info.cantidad ?? "-"}</span></div>
			<div class="detalle-compra-row"><span>Precio unitario</span><span>${formatMoney(info.precioUnitario)}</span></div>
			<div class="detalle-compra-row"><span>Total</span><span>${formatMoney(total || row.debe)}</span></div>
		`;

		bootstrap.Modal.getOrCreateInstance(document.getElementById("modalDetalleCompra")).show();
	}

	// ===================== ANULAR AMORTIZACIÓN =====================
	function abrirConfirmarAnular(row) {
		idFilaPendienteAnular = row.id;
		document.getElementById("anularMontoLabel").textContent = formatMoney(row.haber);
		bootstrap.Modal.getOrCreateInstance(document.getElementById("modalConfirmarAnular")).show();
	}

	function confirmarAnulacion() {
		if (idFilaPendienteAnular == null) return;
		const idx = kardex.findIndex((r) => r.id === idFilaPendienteAnular);
		if (idx === -1) return;

		kardex.splice(idx, 1);
		idFilaPendienteAnular = null;

		renderTabla();

		bootstrap.Modal.getOrCreateInstance(document.getElementById("modalConfirmarAnular")).hide();
		mostrarToast("Se anuló correctamente la amortización del proveedor.");
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
	function mostrarToast(mensaje) {
		const toastEl = document.getElementById("toastExito");
		document.getElementById("toastMensaje").textContent = mensaje;
		const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
		toast.show();
	}

	// ===================== EXPORTAR PDF =====================
	function exportarPDF() {
		if (!window.jspdf || !window.jspdf.jsPDF) {
			mostrarToast("No se pudo cargar el generador de PDF. Verifica tu conexión.");
			return;
		}

		const { jsPDF } = window.jspdf;
		const doc = new jsPDF({ unit: "pt", format: "a4" });
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();

		const verde = [76, 175, 80];
		const verdeOscuro = [56, 142, 60];
		const grisTexto = [50, 54, 60];
		const grisSuave = [120, 125, 132];

		// ---- Banda superior con marca ----
		doc.setFillColor(...verde);
		doc.rect(0, 0, pageWidth, 74, "F");

		doc.setTextColor(255, 255, 255);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(17);
		doc.text("KARDEX INDIVIDUAL DEL PROVEEDOR", 40, 32);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(9.5);
		doc.text("Trazabilidad financiera de compras, pagos y saldos", 40, 50);

		// ---- Datos de contexto ----
		const filtroFecha = document.getElementById("inputFecha")?.value;
		const fechaGeneracion = new Date().toLocaleString("es-BO");

		doc.setTextColor(...grisTexto);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(11);
		doc.text(`Proveedor: ${proveedor.nombre}`, 40, 100);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(9);
		doc.setTextColor(...grisSuave);
		doc.text(`Generado: ${fechaGeneracion}`, pageWidth - 40, 96, { align: "right" });
		if (filtroFecha) {
			doc.text(`Filtro de fecha: ${filtroFecha}`, pageWidth - 40, 110, { align: "right" });
		}

		// ---- Tabla ----
		let totalDebe = 0;
		let totalHaber = 0;
		const body = kardex.map((row, idx) => {
			totalDebe += row.debe || 0;
			totalHaber += row.haber || 0;
			return [
				idx + 1,
				row.fecha,
				row.tipo,
				row.detalle,
				row.debe ? formatMoney(row.debe) : "",
				row.haber ? formatMoney(row.haber) : "",
				formatMoney(row.saldoCalculado ?? 0),
			];
		});

		doc.autoTable({
			startY: 126,
			margin: { left: 40, right: 40 },
			head: [["N°", "Fecha", "Tipo", "Detalle", "Debe", "Haber", "Saldo"]],
			body,
			foot: [["", "", "", "TOTALES", formatMoney(totalDebe), formatMoney(totalHaber), formatMoney(saldoActual)]],
			theme: "grid",
			styles: { font: "helvetica", fontSize: 9, cellPadding: 7, textColor: grisTexto, lineColor: [225, 228, 232], lineWidth: 0.6 },
			headStyles: { fillColor: verde, textColor: 255, fontStyle: "bold", halign: "center", fontSize: 9 },
			footStyles: { fillColor: [232, 245, 233], textColor: verdeOscuro, fontStyle: "bold", lineColor: verde, lineWidth: 0.8 },
			alternateRowStyles: { fillColor: [247, 249, 248] },
			columnStyles: {
				0: { halign: "center", cellWidth: 28 },
				1: { cellWidth: 62 },
				2: { halign: "center", cellWidth: 55 },
				4: { halign: "right", cellWidth: 68 },
				5: { halign: "right", cellWidth: 68 },
				6: { halign: "right", cellWidth: 78 },
			},
		});

		// ---- Pie de página (numeración total correcta) ----
		const totalPaginas = doc.internal.getNumberOfPages();
		for (let i = 1; i <= totalPaginas; i++) {
			doc.setPage(i);
			doc.setDrawColor(...verde);
			doc.setLineWidth(0.8);
			doc.line(40, pageHeight - 32, pageWidth - 40, pageHeight - 32);

			doc.setFont("helvetica", "normal");
			doc.setFontSize(8);
			doc.setTextColor(...grisSuave);
			doc.text("Sistema ERP · Kardex de Proveedores", 40, pageHeight - 18);
			doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - 40, pageHeight - 18, { align: "right" });
		}

		const nombreArchivo = `Kardex_${proveedor.nombre.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
		doc.save(nombreArchivo);
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
		const btnConfirmarAnular = document.getElementById("btnConfirmarAnular");
		const btnExportarPdf = document.getElementById("btnExportarPdf");
		const modalAmortizarEl = document.getElementById("modalAmortizar");
		const modalTipoPagoEl = document.getElementById("modalTipoPago");
		const modalAmortizar = new bootstrap.Modal(modalAmortizarEl);
		const modalTipoPago = new bootstrap.Modal(modalTipoPagoEl);

		// Filtrar (demo: solo re-renderiza la tabla actual)
		btnFiltrar.addEventListener("click", () => {
			renderTabla();
		});

		// Exportar PDF
		btnExportarPdf.addEventListener("click", () => {
			exportarPDF();
		});

		// Delegación de clicks para el botón de menú de cada fila
		document.getElementById("kardexBody").addEventListener("click", (e) => {
			const btn = e.target.closest(".btn-fila-menu");
			if (!btn) return;
			e.stopPropagation();
			const rowId = Number(btn.dataset.rowId);
			const menu = document.getElementById("rowActionMenu");
			const yaAbiertoParaEsteBoton = !menu.classList.contains("d-none") && menu.dataset.ownerId === String(rowId);
			cerrarMenuFila();
			if (yaAbiertoParaEsteBoton) return;
			menu.dataset.ownerId = String(rowId);
			abrirMenuFila(rowId, btn);
		});

		// Cerrar menú contextual al hacer click afuera, hacer scroll o presionar ESC
		document.addEventListener("click", (e) => {
			const menu = document.getElementById("rowActionMenu");
			if (!menu.classList.contains("d-none") && !menu.contains(e.target)) cerrarMenuFila();
		});
		window.addEventListener("scroll", cerrarMenuFila, true);
		document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenuFila(); });

		// Confirmar anulación de amortización
		btnConfirmarAnular.addEventListener("click", confirmarAnulacion);

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

			kardex.push(crearFilaCuota({
				fecha: new Date().toLocaleDateString("es-BO"),
				detalle: `Amortización de deuda (${metodoSeleccionado.nombre})`,
				haber: montoAmortizar,
				metodoPago: metodoSeleccionado.nombre,
			}));

			renderTabla();

			modalTipoPago.hide();
			mostrarToast("Se amortizó correctamente la deuda del proveedor.");

			montoAmortizar = 0;
			metodoSeleccionado = null;
		});
	});
})();
