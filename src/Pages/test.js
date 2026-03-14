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
    key_caja = "f6f1b1f8-1e6e-4628-a562-fce575345e2c";
    // key_caja = "42351594-5d23-4700-b845-32b089360665";
    // key_caja = "cbd5de7c-8976-4721-83d8-0147271fb30a";

    componentDidMount() {
        this.loadData();
    }

    async loadData() {

        const [cajaRaw, usuarios, empresa] = await Promise.all([
            MDL.caja.getByKey(this.key_caja),
            MDL.usuario.getAll(),
            MDL.empresa.getFull()
        ]);

        console.clear();
        console.log("%c" + JSON.stringify(empresa, null, 2), "color: #ff9102; font-weight: bold;");

        const sucursal = empresa?.sucursales.find(s => s.key === cajaRaw.key_sucursal);
        const monedas = empresa?.monedas || [];
        const monedasMap = {};
        monedas.forEach(m => {
            monedasMap[m.key] = m;
        });

        const caja = {
            ...cajaRaw,
            sucursal,
            cajero: usuarios[cajaRaw.key_usuario],
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

        console.log("%c" + JSON.stringify(movimientos, null, 2), "color: #e100ff; font-weight: bold;");

        const movimientosFiltrados = movimientos.map((m) => {

            const etp = empresa_tipo_pago[m.key_empresa_tipo_pago];

            console.log("%c" + JSON.stringify(etp, null, 2), "color: #2ECC40; font-weight: bold;");

            return {
                hora: new SDate(m.fecha_on).toString("hh:mm"),
                descripcion: m.descripcion,
                persona: usuarios[m.key_usuario]?.Nombres || "",
                tipo: etp?.descripcion || "",
                key_tipo_pago: etp?.key_tipo_pago || "",
                tipo_: m.tipo || "",
                monto: m.monto,
                moneda: monedasMap[m.key_moneda] || null,
            };
        });

        const apertura = Number(cajaRaw.monto_apertura) || 0;

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

        resumen.push({ label: "Apertura", value: apertura });

        Object.keys(ventas).forEach(k => {
            resumen.push({
                label: `Ventas ${k}`,
                value: ventas[k]
            });
        });

        if (egresos !== 0) {
            resumen.push({
                label: "Traspaso a banca",
                value: egresos
            });
        }

        const total = resumen.reduce((sum, i) => sum + (Number(i.value) || 0), 0);

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
                    <SPDF.Image src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfiwNZOWWU_5snwjBWULhLyjSjuVLyJw1SQg&s`} style={{ width: 100, height: 50 }} />
                    <SPDF.Text style={{ ...label, fontSize: 16 }}> {caja?.sucursal?.descripcion} </SPDF.Text>
                    <SPDF.Text style={text}> {caja?.sucursal?.direccion} </SPDF.Text>
                    <SPDF.Text style={text}> Tel: {caja?.sucursal?.telefono} </SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flex: 2, alignItems: "end" }}>
                    <SPDF.Text style={{ ...label, fontSize: 16 }}> CIERRE DE CAJA </SPDF.Text>
                    <SPDF.Text style={text}> Fecha: {new SDate(caja?.fecha_on).toString("yyyy MMM ddhh:mm")} </SPDF.Text>
                    <SPDF.Text style={text}> Cajero: {caja?.cajero?.Nombres} </SPDF.Text>
                    <SPDF.Text style={text}> Caja: NRO.45 </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    Cajero() {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 16 }}>
                <SPDF.Text style={label}>Sucursal / Cajero</SPDF.Text>
                {this.espaciopequeño()}
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: 50, height: 40, }}>
                        <SPDF.Image src="https://cdn-icons-png.flaticon.com/512/149/149071.png" style={{ width: 40, height: 40 }} />
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, }}>
                        <SPDF.Text style={label}>Busch</SPDF.Text>
                        <SPDF.Text style={text}>Felicidad Aguilar Jalil</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    detalle() {

        const { movimientos } = this.state;
        return movimientos.map((mov, i) => {
            return (

                <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", marginBottom: 8 }}>
                    <SPDF.View style={{ flex: 1 }}>
                        <SPDF.Text style={text}>{mov.hora}</SPDF.Text>
                        <SPDF.Text style={text}>{mov.persona}</SPDF.Text>
                        <SPDF.Text style={label}>{mov.tipo_}</SPDF.Text>
                        <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                    </SPDF.View>

                    <SPDF.View style={{ flex: 1, alignItems: "end" }}>
                        <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                        <SPDF.Text style={label}>tipo: {mov.key_tipo_pago}</SPDF.Text>
                        <SPDF.Text style={label}>transación: {mov.tipo_}</SPDF.Text>
                        <SPDF.Text style={{ ...text, color: mov.monto < 0 ? "#ff0000" : STheme.color.background }}>Monto: {mov.monto} {mov.moneda.observacion}</SPDF.Text>
                    </SPDF.View>

                </SPDF.View>

            );
        }
        );
    }


    Resumen() {

        const { resumen } = this.state;

        return (

            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>

                <SPDF.View style={{ flex: 1 }} />

                <SPDF.View style={{ flex: 2, padding: 10 }}>

                    {resumen.map((r, i) => {

                        const isTotal = r.label === "Total";

                        return (
                            <SPDF.View key={i} style={{ width: "100%" }}>

                                {isTotal && (<SPDF.View style={{ width: "100%", borderTopWidth: 1, marginBottom: 5, marginTop: 5 }} />)}

                                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                                    <SPDF.View style={{ flex: 1 }}> <SPDF.Text style={text}>{r.label}</SPDF.Text> </SPDF.View>
                                    <SPDF.View style={{ flex: 1, alignItems: "end", }}> <SPDF.Text style={{ color: r.value < 0 ? "#ff0000" : STheme.color.background }}>{r.value}</SPDF.Text> </SPDF.View>
                                </SPDF.View>
                            </SPDF.View>
                        );
                    })}

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
                <SPDF.Text style={style = { text }}>Página {"${current_page}/${cant_page}"}</SPDF.Text>
            </SPDF.View>
        );
    }




    h() {
        return <SPDF.View style={{ width: "100%" }}>
            {this.HeaderCierre()}
            {this.Cajero()}
        </SPDF.View>
    }
    body() {
        return <SPDF.View style={{ width: "100%" }}>

            {this.espacio()}
            {this.Resumen()}
            {this.espacio()}
            {this.Firmas()}
        </SPDF.View>
    }

    imprimirPDF() {

        if (!this.state.ready) return;

        SPDF.create(

            <SPDF.Page style={{ width: 612, height: 791, padding: 20 }} header={this.h()} footer={this.pagina()} >
                {/* {this.espacio()} */}

                {/* <SPDF.Text style={text}> DETALLE </SPDF.Text> */}

                <SPDF.View style={{ width: "100%", alignItems: "center", }}> <SPDF.Text style={text}> DETALLE </SPDF.Text> </SPDF.View>

            
                {this.detalle()}

                {this.espaciopequeño()}
                <SPDF.View style={line} />
                {this.espaciopequeño()}

                {this.body()}

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