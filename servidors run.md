# 📊 ORDEN DE CONSUMO DE APIs - Álvaro App

## ⚡ Resumen Ejecutivo

Durante la inicialización de la aplicación, se consumen **4 servidores de forma secuencial**.

---

## 📋 ORDEN DE CONSUMO - TABLA RESUMIDA

| Orden | Módulo | Servidor | Endpoint | Tipo | ¿API? | ¿Espera? | Estado |
|-------|--------|----------|----------|------|-------|----------|--------|
| 1️⃣ | **usuario** | **rolespermisos** | /api (HTTP) | sendHttpAsync | ✅ | ⏱️ Sí | ✅ Configurado |
| 2️⃣ | **empresa** | **empresa** | /api (Promise) | getEmpresa() | ✅ | ⏱️ Sí | ✅ Configurado |
| 3-9 | (vacíos) | - | - | - | ❌ | - | - |
| 🔟 | **contabilidad** | **contabilidad** | /api (Promise) | cuenta_contable | ✅ | ⏱️ Sí | ✅ Configurado |
| 12 | **caja** | **caja** | /api (Promise) | getActiva() | ✅ | ⏱️ Sí | ⚠️ FALTA CONFIG |
| 12 | (pasarela) | **pasarela** | /api (Promise) | componentMount | ✅ | ⏱️ Sí | ⚠️ FALTA CONFIG |
| 12 | (pasarela_emp) | **pasarela_empresa** | /api (Promise) | componentMount | ✅ | ⏱️ Sí | ⚠️ FALTA CONFIG |

---

## 🎯 LO MÁS IMPORTANTE

### Orden Secuencial

```
1️⃣  usuario           → rolespermisos/api      ✅ CONFIGURADO
    ↓
2️⃣  empresa           → empresa/api            ✅ CONFIGURADO  
    ↓
3-9 (módulos vacíos)  → (no hacen nada)        ❌ NO IMPLEMENTADOS
    ↓
🔟 contabilidad      → contabilidad/api       ✅ CONFIGURADO
    ↓
12 caja              → caja/api               ⚠️  NO CONFIGURADO
   + pasarela        → pasarela/api           ⚠️  NO CONFIGURADO
   + pasarela_emp    → pasarela_empresa/api   ⚠️  NO CONFIGURADO
```

### Características

- ✅ **Todos se ejecutan secuencialmente** con `await` (uno por uno, no en paralelo)
- ⏱️ **Bloqueantes:** Cada uno espera al anterior antes de continuar
- ⚠️ **Crítico:** Los 3 últimos servidores NO están configurados en `socket.ts`

---

## 📊 ESTADÍSTICAS

| Métrica | Cantidad | % |
|---------|----------|-----|
| Consumos de API Implementados | 4 de 16 módulos | 25% |
| Módulos sin componentDidMount | 9 módulos | 56% |
| Listeners Locales (sin API) | 3 módulos | 19% |
| Servidores Faltantes en Config | 3 servidores | ⚠️ CRÍTICO |

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. Servidores No Configurados en socket.ts

```typescript
// FALTA AGREGAR EN: src/Config/socket.ts

apis: {
  // ... otros servidores ...
  
  caja: "https://caja.servisofts.com/http/",           // ❌ FALTA
  pasarela: "https://pasarela.servisofts.com/http/",   // ❌ FALTA
  pasarela_empresa: "https://pasarela_empresa.servisofts.com/http/", // ❌ FALTA
}
```

**Impacto:** La inicialización fallará en el paso 12 cuando intente cargar `caja.componentDidMount()`.

---

## 🌍 SERVIDORES CONSUMIDOS EN PRODUCCIÓN

| Servidor | URL | Estado |
|----------|-----|--------|
| rolespermisos | https://rolespermisos.servisofts.com/http/ | ✅ OK |
| empresa | https://empresa.servisofts.com/http/ | ✅ OK |
| contabilidad | https://contabilidad.servisofts.com/http/ | ✅ OK |
| caja | ??? (falta en socket.ts) | ⚠️ FALTA |
| pasarela | ??? (falta en socket.ts) | ⚠️ FALTA |
| pasarela_empresa | ??? (falta en socket.ts) | ⚠️ FALTA |

---

## 📝 Detalle de Cada Consumo

### 1️⃣ USUARIO → ROLESPERMISOS
**Ubicación:** `src/MDL/usuario/index.ts:14-38`
```javascript
async componentDidMount() {
    await this._loadSessionFromStorage();
}

_loadSessionFromServer = async () => {
    if (!this.session) return;
    const userlist = await this.getByKeys([this.session.key]);  // ← API CALL
    if (userlist.length > 0) {
        this.session = userlist[0];
    }
}
```
- **Método:** HTTP Async (sendHttpAsync)
- **Función:** Valida y carga sesión del usuario
- **Condición:** Siempre (es el primero)

---

### 2️⃣ EMPRESA → EMPRESA
**Ubicación:** `src/MDL/empresa/index.ts:19-46`
```javascript
async componentDidMount() {
    await this.init()
}

async init() {
    this.loadTheme();
    if (this.select) {
      this.select = await this.getEmpresa(this.select.key);  // ← API CALL
      this.setEmpresa(this.select);
    }
}
```
- **Método:** Promise (getEmpresa)
- **Función:** Carga datos de empresa seleccionada
- **Condición:** Si existe empresa en storage

---

### 🔟 CONTABILIDAD → CONTABILIDAD
**Ubicación:** `src/MDL/contabilidad/index.ts:10-12`
```javascript
async componentDidMount() {
    this.cuenta_contable.componentDidMount();  // ← API CALL
}
```
- **Método:** Promise (cuenta_contable.componentDidMount)
- **Función:** Carga datos contables
- **Condición:** Siempre

---

### 12 CAJA → CAJA + PASARELAS ⚠️ CRÍTICO
**Ubicación:** `src/MDL/caja/index.ts:16-24`
```javascript
async componentDidMount() {
    try {
      await this.getActiva();  // ← API CALL (FALTA CONFIG) ⚠️
      await this.pasarela.componentDidMount();  // ← API CALL (FALTA CONFIG) ⚠️
      await this.pasarela_empresa.componentDidMount()  // ← API CALL (FALTA CONFIG) ⚠️
    } catch (error) {
      console.error(error);
    }
}
```
- **Método:** Promise (getActiva)
- **Función:** Carga caja activa + pasarelas
- **Condición:** Si usuario y empresa existen
- **Estado:** ⚠️ **SERVIDORES NO CONFIGURADOS**

---

## ⚙️ Configuración Actual

**Archivo:** `src/Config/socket.ts`

```typescript
export default {
  ssl: true,
  host: "serp.servisofts.com",
  
  port: {
    native: 10048,
    web: 20048,
    http: 30048,
  },
  
  apis: {
    roles_permisos: "https://rolespermisos.servisofts.com/http/",  ✅
    empresa: "https://empresa.servisofts.com/http/",               ✅
    inventario: "https://inventario.servisofts.com/http/",
    compra_venta: "https://compraventa.servisofts.com/http/",
    spdf: "https://spdf.servisofts.com/http/",
    contabilidad: "https://contabilidad.servisofts.com/http/",    ✅
    sqr: "https://qr.servisofts.com/http/",
    facturacion: "https://facturacion.servisofts.com/http/",
    repo: "http://serp.servisofts.com/images/",
    crm: "https://crm.servisofts.com/http/",
    drive: "https://drive.servisofts.com/http/",
    whatsapp: "https://whatsapp.servisofts.com",
    
    // ❌ FALTA: caja, pasarela, pasarela_empresa
  }
}
```

---

## 💡 Recomendaciones

### Acción 1: Configurar Servidores Faltantes
Agregar en `src/Config/socket.ts` bajo `apis`:
```typescript
caja: "https://caja.servisofts.com/http/",
pasarela: "https://pasarela.servisofts.com/http/",
pasarela_empresa: "https://pasarela_empresa.servisofts.com/http/",
```

### Acción 2: Implementar componentDidMount Faltantes
9 módulos no tienen implementación:
- factura, crm, whatsapp, RolesPermisos, inventario, compra_venta, punto_venta, pizarra, habilidad

---

## 📁 Archivos Relacionados

- `src/MDL/index.ts` - Inicialización de módulos
- `src/Config/socket.ts` - Configuración de APIs
- `src/App.js` - Punto de entrada
- `src/Socket.js` - Configuración del socket

---

*Análisis generado: 2026-08-18*
