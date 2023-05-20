import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import Model from '../../../../Model';
import { SDate, SHr, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "key_usuario", "key_servicio"]
        });
        this.state = {
            // proveedor: {}
        }
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
        this.empresa = Model.empresa.Action.getSelect();
        var data = Parent.model.Action.getByKey(this.pk);
        console.log(this.empresa)

        if (!this.empresa) return null;
        return data
    }

    __separador() {
        return <>
            <SHr />
            <SHr height={1} color={STheme.color.card} />
            <SHr />
        </>
    }
    $render() {
        this.data = this.$getData()
        if (!this.data) return <SLoad />
        return <SView col={"xs-12"} center card style={{ padding: 14 }}>
            <SText center bold>{this.data?.tipo}</SText>
            <SText center bold>{this.data?.descripcion}</SText>
            <SText center bold>{this.data?.observacion}</SText>
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
        if (!this.data?.proveedor) {
            return <SView col={"xs-12"} center>
                <SHr height={24} />
                <SView style={{
                    padding: 16
                }} card onPress={() => {
                    SNavigation.navigate("/rol/profile/usuarios", {
                        pk: "b9c32543-ca5a-40f6-97b6-643633cbee9e", onSelect: (obj) => {
                            console.log(obj);
                            var proveedor = {
                                nit: obj.CI,
                                razon_social: obj.Nombres + " " + obj.Apellidos,
                                key_usuario: obj.key,
                                direccion: "DIRECCION TODO TODO",
                                sucursal: "SUCURSAL TODO"
                            }
                            this.data.proveedor = proveedor;
                            Model.compra_venta.Action.editar({
                                data: this.data,
                                key_usuario: Model.usuario.Action.getKey()
                            }).then((resp) => {
                                console.log("Se agrego el proveedor con exito")
                            })
                        }
                    })
                }}>
                    <SText bold color={STheme.color.danger} >SELECCIONE EL PROVEEDOR</SText>
                </SView>
                <SHr height={24} />
            </SView>
        }

        var { nit, razon_social, key_usuario, direccion, sucursal, direccion } = this.data.proveedor
        return <SView col={"xs-12"} center>
            <SHr />
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card>
                </SView>
            </SView>
            <SHr />
            <SText center col={"xs-10"}>{razon_social + "\n" + sucursal + "\n" + nit + "\n" + direccion}</SText>
            <SHr />
            <SText center>{"Tel. 75313378 \nSanta Cruz"}</SText>
        </SView>
    }

    cliente_item({ label, value }) {
        return <SView col={"xs-12"} row>
            <SText bold flex style={{ alignItems: 'end', textAlign: "end" }}>{label}</SText>
            <SView width={8} />
            <SText flex style={{
                justifyContent: "flex-end"
            }}>{value}</SText>
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
            {this.cliente_item({ label: "NOMBRE/RAZÓN SOCIAL:", value: this.empresa?.razon_social })}
            <SHr />
            {this.cliente_item({ label: "NIT/CI/CEX:", value: this.empresa?.nit })}
            <SHr />
            {this.cliente_item({ label: "COD. CLIENTE:", value: "TODO" })}
            <SHr />
            {this.cliente_item({ label: "FECHA DE EMISIÓN:", value: new SDate().toString("dd/MM/yyyy hh:mm") })}
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
                <SText>{}</SText>
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
            <SHr />
            <SView card style={{
                padding: 16
            }}>
                <SText bold color={STheme.color.danger}>AGREGAR PRODUCTO O SERVICIO</SText>
            </SView>
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
            <SHr height={4} />
            {this.totales_item({ label: "DESCUENTO Bs.", value: 0 })}
            <SHr height={4} />
            {this.totales_item({ label: "TOTAL Bs.", value: 5478.15 })}
            <SHr height={4} />
            {this.totales_item({ label: "MONTO GIFCARD Bs.", value: 0.0 })}
            <SHr height={4} />
            {this.totales_item({ label: "TOTAL A PAGAR Bs.", bold: true, value: 5478.15 })}
            <SHr height={4} />
            {this.totales_item({ label: "IMPORTE BASE CREDITO FISCAL", bold: true, value: 5478.15 })}
            <SHr />
            <SHr />
            <SText center>{"SON: " + SMath.numberToLetter(5478.15)}</SText>
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
                <SHr height={50} />

            </SView>
        </SView>
    }
}
export default connect(index);