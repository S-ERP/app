import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import Model from '../../../../Model';
import { SHr, SMath, SText, STheme, SView } from 'servisofts-component';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "key_usuario", "key_servicio"]

        });
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    __separador() {
        return <>
            <SHr />
            <SHr height={1} color={STheme.color.card} />
            <SHr />
        </>
    }
    $render() {
        return <SView col={"xs-12"} center card style={{ padding: 14 }}>
            <SText center bold>FACTURA {"\n"} CON DERECHO A CRÉDITO FISCAL</SText>
            {this.__separador()}
            {this.proveedor()}
            {this.__separador()}
            {this.cliente()}
            {this.__separador()}
            {this.detalle()}
            {this.__separador()}
            {this.totales()}
            {this.__separador()}
            {this.footer()}
        </SView>
    }

    proveedor() {
        return <SView col={"xs-12"} center>
            <SHr />
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card>
                </SView>
            </SView>
            <SHr />
            <SText center col={"xs-10"}>{"FRIGORIFICO BFC S.A.\nCASA MATRIZ\n75313378\nAVENIDA 4TO ANILLO , EDIFICIO: TORRES DUO ,PISO: 5 ,DEPARTAMENTO FRIGORIFICO BFC S.A."}</SText>
            <SHr />
            <SText center>{"Tel. 75313378 \nSanta Cruz"}</SText>
        </SView>
    }

    cliente_item({ label, value }) {
        return <SView col={"xs-12"} row>
            <SText bold flex style={{ alignItems: 'end', textAlign: "end" }}>{label}</SText>
            <SView width={8} />
            <SText flex>{value}</SText>
        </SView>
    }
    cliente() {
        return <SView col={"xs-12"} center>
            <SHr />
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card>
                </SView>
            </SView>
            <SHr />
            {this.cliente_item({ label: "NOMBRE/RAZÓN SOCIAL:", value: "SUAREZ ANTEZANA SEGUNDO" })}
            <SHr />
            {this.cliente_item({ label: "NIT/CI/CEX:", value: "44554433" })}
            <SHr />
            {this.cliente_item({ label: "COD. CLIENTE:", value: "234234" })}
            <SHr />
            {this.cliente_item({ label: "FECHA DE EMISIÓN:", value: "01/12/2022 07:44 AM" })}
            <SHr />

        </SView>
    }

    detalle_item({ nombre, precio, cantidad }) {
        return <SView col={"xs-12"} row center>
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card>
                </SView>
            </SView>
            <SView flex>
                <SText bold >{nombre}</SText>
                <SText>{SMath.formatMoney(precio)} X {SMath.formatMoney(cantidad)}</SText>
            </SView>
            <SView width={8} />
            <SText col={"xs-3"} style={{ alignItems: 'end', textAlign: "end" }}>{SMath.formatMoney(precio * cantidad)}</SText>
        </SView>
    }
    detalle() {
        return <SView col={"xs-12"} center>
            <SHr />
            <SText bold>DETALLE</SText>
            <SHr />
            {this.detalle_item({ nombre: "21170-CHARQUE DE 1ERA", cantidad: 50.00, precio: 27.900, })}
            <SHr />
            {this.detalle_item({ nombre: "23432-CHARQUE DE 1ERA", cantidad: 50.00, precio: 27.900, })}
            <SHr />
            {this.detalle_item({ nombre: "32523-CHARQUE DE 1ERA", cantidad: 50.00, precio: 27.900, })}
        </SView>
    }

    totales_item({ label, value, bold }) {
        return <SView col={"xs-12"} row>
            <SText bold={bold} flex style={{ alignItems: 'end', textAlign: "end" }}>{label}</SText>
            <SView width={8} />
            <SText flex style={{ alignItems: 'end', textAlign: "end" }}>{SMath.formatMoney(value)}</SText>
        </SView>
    }

    totales() {
        return <SView col={"xs-12"} center>
            <SHr />
            {this.totales_item({ label: "SUBTOTAL Bs.", value: 5478.15 })}
            {this.totales_item({ label: "DESCUENTO Bs.", value: 0 })}
            {this.totales_item({ label: "TOTAL Bs.", value: 5478.15 })}
            {this.totales_item({ label: "MONTO GIFCARD Bs.", value: 0.0 })}
            {this.totales_item({ label: "TOTAL A PAGAR Bs.", bold: true, value: 5478.15 })}
            {this.totales_item({ label: "IMPORTE BASE CREDITO FISCAL", bold: true, value: 5478.15 })}
            <SHr />
            <SHr />
            <SText center>{"SON :CINCO MIL CUATROCIENTOS SETENTA Y OCHO 15/100 BOLIVIANOS"}</SText>
        </SView>
    }

    footer() {
        return <SView col={"xs-12"} center>
            <SView col={"xs-11"} center >
                <SHr />
                <SText center>{"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"}</SText>
                <SHr />
                <SText center>{"Ley N° 453: Está prohibido importar, distribuir o comercializar productos prohibidos o retirados en el país de origen por atentar a la integridad física y a la salud."}</SText>
                <SHr />
                <SText center>{"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido fuera de linea,verifique su envio con su proveedor o en la página web www.impuestos.gob.bo"}</SText>
                <SHr />
            </SView>
        </SView>
    }
}
export default connect(index);