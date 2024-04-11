//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDate, SNavigation, SPage, SText, SThread, SLoad,SHr } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

// create a component
export default class init extends Component {

    constructor(props) {
        super(props);
        // this.path = SNavigation.getParam("path");
        this.onEnd = SNavigation.getParam("onEnd")

    }

    componentDidMount() {
        if (this.isrun) return;
        this.isrun = true;
        this.start();
    }
    componentWillUnmount() {
        this.isrun = true;
    }

    async start() {
        console.log("INICIO EL START DEL INIT");

        // ***** AGREGAR PARTICIPANTE *******
        const participante_resp = await this.volver_participante()
        if (participante_resp.estado != "exito") {
            console.error("Ocurrio un error al volverte un participante de la empresa", participante_resp?.error)
        }

        // *****   ROLES Y PERMISOS *******
        const rol_resp = await this.init_rol()
        if (rol_resp.estado != "exito") {
            console.error("Ocurrio un error al iniciar el rol", rol_resp?.error)
            return;
        }
        const clone_rol_resp = await this.clone_permisos(rol_resp.data.key)
        if (clone_rol_resp.estado != "exito") {
            console.error("Ocurrio un error al iniciar el rol", clone_rol_resp?.error)
        }
        const set_rol_resp = await this.set_rol(rol_resp.data.key)
        if (set_rol_resp.estado != "exito") {
            console.error("Ocurrio un error al registrar al usuario en el rol", set_rol_resp?.error)
        }

        // ***** SUCURSALES *******
        const centrocosto = await this.crear_centro_costo();
        if (centrocosto.estado != "exito") {
            console.error("Ocurrio un error al registrar el centro de costo", centrocosto?.error)
        }
        const sucursal = await this.crear_sucursal(centrocosto.data)
        if (sucursal.estado != "exito") {
            console.error("Ocurrio un error al registrar la sucursal", sucursal?.error)
        }
        const punto_de_venta = await this.crear_punto_de_venta(sucursal.data)
        if (punto_de_venta.estado != "exito") {
            console.error("Ocurrio un error al registrar el punto de venta", punto_de_venta?.error)
        }
        const almacen = await this.crear_almacen(sucursal.data)
        if (almacen.estado != "exito") {
            console.error("Ocurrio un error al registrar el almacen", almacen?.error)
        }

        // ***** TAREAS *******
        const label_configuracion = (await this.crear_label({ descripcion: "Configuración", color: "#666666" })).data;
        const label_error = (await this.crear_label({ descripcion: "Error", color: "#FF0000" })).data;
        const tarea = (await this.crear_actividad_de_bienvenida()).data;
        const tarea_label = await this.crear_tarea_label({ key_label: label_configuracion.key, key_tarea: tarea.key })
        await this.crear_primer_comentario(tarea)



        SNavigation.goBack();
        if (this.onEnd) this.onEnd();


    }
    async crear_centro_costo() {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "contabilidad",
            "component": "centro_costo",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "codigo": "Casa Matriz",
                "descripcion": "Casa Matriz",
                "key_empresa": Model.empresa.Action.getKey()
            },
            "key_empresa": Model.empresa.Action.getKey(),
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async crear_sucursal(centro_costo) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "empresa",
            "component": "sucursal",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "descripcion": "Casa Matriz",
                "telefono": "+591 ",
                "codigo_facturacion": "0",
                "key_empresa": Model.empresa.Action.getKey(),
                "key_centro_costo": centro_costo.key
            },
            "key_usuario": Model.usuario.Action.getKey(),
            "key_empresa": Model.empresa.Action.getKey()
        })
    }
    async crear_punto_de_venta(sucursal) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "empresa",
            "component": "punto_venta",
            "type": "registro",
            "data": {
                "descripcion": "0",
                "codigo_facturacion": "0",
                "fraccionar_moneda": "false",
                "key_sucursal": sucursal.key,
                // "key_cuenta_contable": "a40d8b2d-9acc-44bd-9c1f-58a6784511e6"
            },
            "key_usuario": Model.usuario.Action.getKey(),
            "key_empresa": Model.empresa.Action.getKey()
        })
    }
    async crear_almacen(sucursal) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "inventario",
            "component": "almacen",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "key_sucursal": sucursal.key,
                "descripcion": "Almacen 1"
            },
            "key_usuario": Model.usuario.Action.getKey(),
            "key_empresa": Model.empresa.Action.getKey()
        })
    }
    async crear_label({ descripcion, color }) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "component": "label",
            "type": "registro",
            "data": {
                "descripcion": descripcion,
                "color": color,
                "key_empresa": Model.empresa.Action.getKey(),
            },
            "key_empresa": Model.empresa.Action.getKey(),
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async crear_tarea_label({ key_tarea, key_label }) {
        return await SSocket.sendPromise({
            "component": "tarea_label",
            "type": "registro",
            "key_tarea": key_tarea,
            "key_label": key_label,
            "key_empresa": Model.empresa.Action.getKey(),
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async init_rol() {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "rol",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "descripcion": "Administrador",
                "key_empresa": Model.empresa.Action.getKey()
            },
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async clone_permisos(key_rol) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "permiso",
            "type": "clone_rol",
            "estado": "cargando",
            key_rol_from: "0c15f8c1-f053-402c-af38-385d8c55b8a1",
            key_rol_to: key_rol,
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async set_rol(key_rol) {
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "roles_permisos",
            "component": "usuarioRol",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "key_rol": key_rol,
                "key_usuario": Model.usuario.Action.getKey()
            },
            "key_usuario": Model.usuario.Action.getKey(),
        })
    }
    async volver_participante() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        return await SSocket.sendPromise({
            "version": "1.0",
            "service": "empresa",
            "component": "empresa_usuario",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "key_usuario": Model.usuario.Action.getKey(),
                "key_empresa": Model.empresa.Action.getKey(),
                "alias": `${usuario.Nombres} ${usuario.Apellidos}`,
                "empresa": Model.empresa.Action.getSelect(),
            },
        })
    }
    async crear_actividad_de_bienvenida() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        return await SSocket.sendPromise({
            "version": "1.0",
            "component": "tarea",
            "type": "registro",
            "data": {
                "key": "new",
                "fecha_inicio": new SDate().toString(),
                "fecha_fin": new SDate().addHour(1).toString(),
                "descripcion": "Configuración de la empresa.",
                "estado": 1,
                "color": "#E7E28D",
                "key_usuario": Model.usuario.Action.getKey(),
                "key_empresa": Model.empresa.Action.getKey(),
            },
            "key_usuario": Model.usuario.Action.getKey(),
            "key_empresa": Model.empresa.Action.getKey(),
        })
    }
    async crear_primer_comentario(tarea) {
        // const usuario = Model.usuario.Action.getUsuarioLog();
        let empresa = Model.empresa.Action.getSelect();
        return await SSocket.sendPromise({
            "component": "tarea_comentario",
            "type": "registro",
            "data": {
                "descripcion": `
Bienvenido a la empresa ${empresa.razon_social}

Se realizaron las siguientes tareas automáticamente:
- ✅ Se configuró los roles y permisos.
- ✅ Se agregó al usuario creador a la empresa.
- ✅ Se concedió el rol Administrador al usuario creador.
- ✅ Se registró un centro de costo Caza Matriz.
- ✅ Se registró la sucursal Caza Matriz.
- ✅ Se registró el Punto de venta 0.
- ✅ Se registró el Almacén 1.

- ✅ Se registró label para las tareas por defecto.

- ⚠️ Falta crear una nota por defecto.
- ⚠️ Falta configurar los tipos de pago que acepta el punto venta.
- ⚠️ Falta configurar los tipos de productos, marcas, modelos.
- ⚠️ Falta crear proveedores.
- ⚠️ Falta crear clientes.
- ⚠️ Falta invitar personal.
- ⚠️ Falta crear compras.
- ⚠️ Falta crear ventas.
- ⚠️ Falta abrir caja y utilizarla.

                `,
                "tipo": "comentario"
            },
            "key_tarea": tarea.key,
            "key_usuario": Model.usuario.Action.getKey(),
            "key_empresa": Model.empresa.Action.getKey(),
        })
    }





    render() {
        return <SPage title={"init"} center>
            <SLoad/> 
            <SHr height={10} />
            <SText>Configurando la empresa...</SText>
        </SPage>
    }
}
