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



  <SInput2 ref={ref => item.__ref = ref} autoFocus name={`monto_${item.key}`} type="money"
                                        style={{ width: "100%", textAlign: "right", fontSize: 14, }}
                                        defaultValue={String(MDL.contabilidad.round(parseFloat(item.monto ?? "0") / parseFloat(item.moneda?.tipo_cambio || 1)))}
                                        onChangeText={(e) => {
                                            const val = parseFloat(e) || 0;
                                            item.monto = val;
                                            if (val > 0) {
                                                item.monto = MDL.contabilidad.round(val * parseFloat(item.moneda?.tipo_cambio || 1))
                                                if (item.__ref_extranjera) {
                                                    item.__ref_extranjera.setValue(item.monto);
                                                }
                                            }
                                            this.forceUpdate();
                                        }}
                                    />