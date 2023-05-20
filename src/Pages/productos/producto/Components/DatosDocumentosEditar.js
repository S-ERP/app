import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SForm, SHr, SLoad, SNavigation, SOrdenador, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import SSocket from 'servisofts-socket'
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };


    }

    async onSubmit(data, ref, key_producto, callback) {
        var arr = Object.keys(data);
        var data_final_array = []
        for (let i = 0; i < arr.length; i++) {
            const key_dato = arr[i];
            var dto = Object.values(this.producto_inventario_dato).find(o => o.key_inventario_dato == key_dato);
            var dato_str = data[key_dato];
            if (!dato_str) {
                if (dto) {
                    if (dto.descripcion == dato_str) continue;
                } else {
                    continue;
                }
            }
            if (typeof dato_str != "string") {
                dato_str = JSON.stringify(dato_str);
            }
            if (!dto) {
                data_final_array.push({
                    key_producto: key_producto ?? this.props.key_producto,
                    descripcion: dato_str,
                    key_inventario_dato: key_dato
                })

            } else {
                if (dto?.descripcion != dato_str) {
                    data_final_array.push({
                        ...dto,
                        descripcion: dato_str,
                    })

                }

            }

        }
        console.log("entro  a subir los files")
        // ref.uploadFiles2(
        //     SSocket.api.inventario + "upload/producto_inventario_dato/" + key_producto,
        // );
        console.log("entro  a registro all")
        Model.producto_inventario_dato.Action.registroAll(data_final_array).then((resp) => {
            this.setState({ loading: false, loadingLabel: "Guardando con exito" });
            Model.usuario_dato.Action._dispatch(resp);
            if (callback) {
                callback();
                return;
            }
            // SNavigation.goBack();
        }).catch(e => {
            this.setState({ loading: false, loadingLabel: JSON.stringify(e) });
            console.log(e);
        })
        callback();
    }

    getDatos() {
        var datos;
        if (this.props?.key_producto) {
            datos = Model.inventario_dato.Action.getAllByKeyProducto(this.props.key_producto);
            this.producto_inventario_dato = Model.producto_inventario_dato.Action.getAllBy({
                key_producto: this.props.key_producto
            })
            if (!this.producto_inventario_dato) return null;

        } else if (this.props.key_tipo_producto) {
            this.producto_inventario_dato = {};
            datos = Model.inventario_dato.Action.getAllByKeyTipoProducto(this.props?.key_tipo_producto)
        }
        if (!datos) return null;
        var inputs = {};
        // console.log( new SOrdenador([{ key: "tipo", order: "desc", peso: 1 }]).ordernarObject(datos))
        new SOrdenador([{ key: "tipo", order: "desc", peso: 1 }]).ordernarObject(datos).map((key) => {
            var obj = datos[key];
            var dto = Object.values(this.producto_inventario_dato).find(o => o.key_inventario_dato == obj.key);
            var defaultValue = dto?.descripcion;
            var filePath = SSocket.api.inventario + "producto_inventario_dato/" + this.props.key_producto;
            // console.log(obj);
            inputs[obj.key] = { label: obj.descripcion, icon: <SText>{obj.observacion}</SText>, type: obj.tipo, required: obj?.tpid?.requerido, defaultValue: defaultValue, filePath: filePath }
        })
        
        return <SForm ref={(ref) => this.form = ref} inputs={inputs} onSubmitName={""} 
        onSubmit={(data, ref) => {
            // console.log("subir")
            // console.log(data);
            // var files = ref.getFiles()
            this.setState({ loading: true, loadingLabel: "Subiendo archivos..." });
            if (this.props.onSubmit) {
                this.props.onSubmit().then(({ key, callback }) => {
                    ref.uploadFiles2(
                        SSocket.api.inventario + "upload/producto_inventario_dato/" + key
                    ).then((resp) => {
                        this.setState({ loading: true, loadingLabel: "Guardando cambios..." });
                        this.onSubmit(data, ref, key, callback);
                    }).catch((e) => {
                        this.setState({ loading: false, loadingLabel: "Error al subir los archivos..." });
                    })
                }).catch(e => {
                    this.setState({ loading: true, loadingLabel: <SText color={STheme.color.danger}>"Error en los datos, Inserte correctamente los datos."</SText> });
                    new SPromise((resolve, reject) => {

                    }, 1000).then(e => {
                        this.setState({ loading: false, loadingLabel: "" });
                    }).catch(e => {
                        this.setState({ loading: false, loadingLabel: "" });

                    })
                })
            }

        }} />
    }
    getLoading() {
        if (!this.state.loading) return null;
        return <SView center col={"xs-12"} height style={{
            position: "absolute",
        }} card>
            <SLoad />
            <SText>{this.state.loadingLabel}</SText>
        </SView>
    }
    render() {
        return (
            <SView col={"xs-12"} center>
                {/* <SHr /> */}
                {/* <SHr /> */}
                {/* <SText fontSize={14} color={STheme.color.gray}>Recuerde precionar el boton "Confirmar" para guardar los cambios.</SText> */}
                {/* <SHr /> */}
                {this.getDatos()}
                <SButtom type={"danger"} onPress={() => {
                    if (!this.form) {
                        this.props.onSubmit();
                    } else {
                        this.form.submit();
                    }
                }}>
                    ACEPTAR
                </SButtom>

                <SLoad type='window' hidden={!this.state.loading} label={this.state.loadingLabel} onCancel={() => {
                    this.setState({ loading: !this.state.loading, loadingLabel: "" });
                }} />

            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);