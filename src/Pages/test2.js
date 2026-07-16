import React from 'react';
import { SPage, SText, STheme, SDate } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf'
import MDL from '../MDL';

const fontSize = 12;
const labelSize = 11;

const text = {
    fontSize: fontSize,
    font: "Roboto",
};

const label = {
    fontSize: labelSize,
    fontWeight: "bold",
    font: "Roboto",
};

const line = {
    width: "100%",
    height: 1.5,
    backgroundColor: "#DDDDDD",
};

export default class index extends React.Component {

    state = {
        caja: null,
        movimientos: [],
        resumen: [],
        ready: false
    }

    key_caja = "42351594-5d23-4700-b845-32b089360665";

    componentDidMount() {
        this.loadData();
    }

    async loadData() {

        const [cajaRaw, usuarios, empresa] = await Promise.all([
            MDL.caja.getByKey(this.key_caja),
            MDL.usuario.getAll(),
            MDL.empresa.getFull()
        ]);

        const sucursal = empresa?.sucursales.find(s => s.key === cajaRaw.key_sucursal);

        const caja = {
            ...cajaRaw,
            sucursal,
            cajero: usuarios[cajaRaw.key_usuario]
        };

        const [movimientos, empresa_tipo_pago] = await Promise.all([
            MDL.caja.getDetalle(this.key_caja),
            MDL.caja.empresa_tipo_pago_getAll()
        ]);

        movimientos.sort(
            (a, b) =>
                new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() -
                new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime()
        );

        const movimientosFiltrados = movimientos.map((m) => {

            const etp = empresa_tipo_pago[m.key_empresa_tipo_pago];

            return {
                hora: new SDate(m.fecha_on).toString("hh:mm"),
                descripcion: m.descripcion,
                persona: usuarios[m.key_usuario]?.Nombres || "",
                tipo: etp?.descripcion || "",
                key_tipo_pago: etp?.key_tipo_pago || "",
                monto: m.monto
            }

        });

        // RESUMEN

        const apertura = cajaRaw.monto_apertura ?? 0;

        let ventas = {};
        let egresos = 0;

        movimientosFiltrados.forEach((m) => {

            if (m.monto > 0) {

                if (!ventas[m.tipo]) ventas[m.tipo] = 0;
                ventas[m.tipo] += m.monto;

            } else {
                egresos += m.monto;
            }

        });

        const resumen = [];

        resumen.push({ label: "Apertura", value: apertura ?? "0" });

        Object.keys(ventas).forEach(k => {
            resumen.push({
                label: `Ventas ${k}`,
                value: ventas[k]
            })
        });

        if (egresos !== 0) {
            resumen.push({
                label: "Traspaso a banca",
                value: egresos
            });
        }

        const total = resumen.reduce((sum, i) => sum + i.value, 0);

        resumen.push({
            label: "Total",
            value: total
        });

        this.setState({
            caja,
            movimientos: movimientosFiltrados,
            resumen,
            ready: true
        });
    }

    espacio() {
        return <SPDF.View style={{ width: "100%", height: 15 }} />;
    }

    espaciopequeño() {
        return <SPDF.View style={{ width: "100%", height: 8 }} />;
    }

    HeaderCierre() {

        const { caja } = this.state;

        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>

                <SPDF.View style={{ flex: 3 }}>

                    <SPDF.Text style={{ ...label, fontSize: 16 }}>
                        {caja?.sucursal?.descripcion}
                    </SPDF.Text>

                    <SPDF.Text style={text}>
                        {caja?.sucursal?.direccion}
                    </SPDF.Text>

                    <SPDF.Text style={text}>
                        Tel: {caja?.sucursal?.telefono}
                    </SPDF.Text>

                </SPDF.View>

                <SPDF.View style={{ flex: 2, alignItems: "end" }}>

                    <SPDF.Text style={{ ...label, fontSize: 16 }}>
                        CIERRE DE CAJA
                    </SPDF.Text>

                    <SPDF.Text style={text}>
                        Fecha: {new SDate(caja?.fecha_on).toString("yyyy MMM dd  hh:mm")}
                    </SPDF.Text>

                    <SPDF.Text style={text}>
                        Cajero: {caja?.cajero?.Nombres}
                    </SPDF.Text>

                </SPDF.View>

            </SPDF.View>
        );
    }

    detalle() {

        const { movimientos } = this.state;
        
        console.log("%c" + JSON.stringify(movimientos, null, 2), "color: #2ECC40; font-weight: bold;");



        return (

            <SPDF.View style={{ width: "100%", marginTop: 25 }}>

                <SPDF.Text style={{ ...label, textAlign: "center" }}>
                    Detalle
                </SPDF.Text>

                {this.espaciopequeño()}
                <SPDF.View style={line} />
                {this.espaciopequeño()}

                {movimientos.map((mov, i) => {

                    return (

                        <SPDF.View key={i} style={{ width: "100%", flexDirection: "row" }}>

                            <SPDF.View style={{ flex: 1 }}>

                                <SPDF.Text style={text}>{mov.hora}</SPDF.Text>
                                <SPDF.Text style={text}>{mov.persona}</SPDF.Text>
                                <SPDF.Text style={label}>{mov.key_tipo_pago}</SPDF.Text>
                                <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                                <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>

                            </SPDF.View>

                            <SPDF.View style={{ flex: 1, alignItems: "end" }}>

                                <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                                <SPDF.Text style={text}>{mov.monto}</SPDF.Text>

                            </SPDF.View>

                        </SPDF.View>

                    );
                })}

            </SPDF.View>
        );
    }

    Resumen() {

        const { resumen } = this.state;

        return (

            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>

                <SPDF.View style={{ flex: 1 }} />

                <SPDF.View style={{ flex: 2, padding: 10 }}>

                    {resumen.map((r, i) => (

                        <SPDF.View key={i} style={{ width: "100%", flexDirection: "row" }}>

                            <SPDF.View style={{ flex: 1 }}>
                                <SPDF.Text style={text}>{r.label}</SPDF.Text>
                            </SPDF.View>

                            <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                                <SPDF.Text>{r.value}</SPDF.Text>
                            </SPDF.View>

                        </SPDF.View>

                    ))}

                </SPDF.View>

                <SPDF.View style={{ flex: 1 }} />

            </SPDF.View>

        );
    }

    Firmas() {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 50, flexDirection: "row" }}>

                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Cajero</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={text}>Administrador</SPDF.Text>
                </SPDF.View>

            </SPDF.View>
        );
    }

    pagina() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
                <SPDF.Text style={text}>
                    Página 1 / 1
                </SPDF.Text>
            </SPDF.View>
        );
    }

    imprimirPDF() {

        if (!this.state.ready) return;

        SPDF.create(

            <SPDF.Page style={{ width: 612, height: 791, padding: 20 }}>

                {this.HeaderCierre()}
                {this.espacio()}
                {this.detalle()}
                {this.espacio()}
                {this.Resumen()}
                {this.espacio()}
                {this.Firmas()}
                {this.espacio()}
                {this.pagina()}

            </SPDF.Page>

        );
    }

    render() {

        return (

            <SPage title="Cierre de Caja PDF" center>

                <SText
                    style={{ color: STheme.color.text }}
                    onPress={() => this.imprimirPDF()}
                >
                    Generar PDF Cierre de Caja
                </SText>

            </SPage>

        );
    }
}