Cuando me pidas aumentar decimales, haré automáticamente:

📍 Frontend - Visualización (DetalleItem.js, table.js)

// De:
SMath.formatMoney(monto)

// A:
SMath.formatMoney(monto, 5)  // o el número que pidas
📍 Frontend - Formularios (FormularioModelo.tsx)

// De:
.toFixed(2)
type: "money"

// A:
.toFixed(5)  // o el número que pidas
type: "text"
placeholder: "0,00000"
.replace('.', ',')  // formato local
📍 Backend (CajaDetalle.java)
Generalmente no necesita cambios (la BD ya almacena los decimales)
Próxima vez solo di: "aumenta a X decimales" y se hará automáticamente en todos los archivos. 🎯

