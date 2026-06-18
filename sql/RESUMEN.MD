# Clonador de Empresa — Resumen de tablas

## empresa
| Tabla | Notas |
|---|---|
| `empresa` | PK directo |
| `empresa_moneda` | mapeo retornado en respuesta |
| `empresa_usuario` | |
| `sucursal` | mapeo retornado en respuesta |
| `punto_venta` | mapeo retornado en respuesta |

## caja
| Tabla | Notas |
|---|---|
| `pasarela_empresa` | |
| `empresa_tipo_pago` | usa mapeo de `pasarela_empresa` + `empresa_moneda` (empresa) + `punto_venta` (empresa) + `cuenta_contable` (contabilidad) |
| `empresa_tipo_pago_punto_venta` | usa mapeo de `empresa_tipo_pago` |

## roles_permisos
| Tabla | Notas |
|---|---|
| `rol` | |
| `rol_permiso` | usa mapeo de `rol` |
| `usuario_rol` | usa mapeo de `rol` |

## contabilidad
| Tabla | Notas |
|---|---|
| `enviroment` | |
| `diario` | |
| `cuenta_contable` | usa mapeo de `empresa_moneda` (empresa); mapeo retornado en respuesta |
| `ajuste_empresa` | usa mapeo de `cuenta_contable` |
| `centro_costo_tipo` | |
| `centro_costo` | usa mapeo de `centro_costo_tipo` |
| `centro_costo_detalle` | usa mapeo de `centro_costo` (ambas FK) |
| `cuenta_centro_costo` | usa mapeo de `centro_costo` + `cuenta_contable` |

## inventario
| Tabla | Notas |
|---|---|
| `tipo_costo` | |
| `marca` | |
| `almacen` | usa mapeo de `sucursal` (empresa) |
| `ingrediente` | |
| `tag` | |
| `tipo_producto` | |
| `modelo` | usa mapeo de `tipo_producto` + `marca` |
| `modelo_ingrediente` | usa mapeo de `modelo` + `ingrediente` |
| `modelo_tag` | usa mapeo de `modelo` + `tag` |
| `modelo_cliente` | usa mapeo de `modelo` + `cliente` (crm) + `cuenta_contable` (contabilidad) |

## crm
| Tabla | Notas |
|---|---|
| `tipo_cliente` | |
| `cliente` | mapeo retornado en respuesta |
| `cliente_tipo_cliente` | usa mapeo de `cliente` + `tipo_cliente` |

## serp
| Tabla | Notas |
|---|---|
| `habilidad` | |
| `habilidad_usuario` | usa mapeo de `habilidad` |
| `nota` | auto-referencia `key_nota → nota`; 2 pasadas: clonar + UPDATE |
| `nota_usuario` | usa mapeo de `nota` |
| `pizarra` | |
| `pizarra_usuario` | usa mapeo de `pizarra` |

---

## Mapeos cross-módulo

| Módulo | Campo retornado | Consumido por |
|---|---|---|
| empresa | `mapeo.empresa_moneda` | caja → `empresa_tipo_pago.key_moneda`, contabilidad → `cuenta_contable.key_moneda`, inventario → `modelo.precio_venta_moneda` / `precio_compra_moneda` |
| empresa | `mapeo.sucursal` | inventario → `almacen.key_sucursal` |
| empresa | `mapeo.punto_venta` | caja → `empresa_tipo_pago_punto_venta.key_punto_venta` |
| contabilidad | `mapeo.cuenta_contable` | inventario → `modelo_cliente.key_cuenta_contable`, caja → `empresa_tipo_pago.key_cuenta_contable` |
| crm | `mapeo.cliente` | inventario → `modelo_cliente.key_cliente` |
