import React from "react";
import { SImage, SPage, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import SSocket from "servisofts-socket";

export default class table extends React.Component {
    async loadData() {
        const contactos = await MDL.crm.cliente.getAll();
        // const tipos = await MDL.crm.tipoCliente.getAll()
        const habilidades = await MDL.habilidad.getAllWithUsuarios();
        contactos.forEach(contacto => {
            contacto.habilidades = (habilidades ?? []).filter(h => h.key_usuarios?.includes(contacto.key)) ?? [];
        });
        return contactos;
    }
    render() {
        return <SPage title={"contactos"} disableScroll>
            <DinamicTable
                {...Config.table.applyTheme()}
                loadData={this.loadData.bind(this)}
            >
                <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                <DinamicTable.Col
                    key="key"
                    label="Foto"
                    width={40}
                    data={e => `${SSocket.api.root}usuario/${e.row?.key}`}
                    customComponent={e => (
                        <SView col="xs-12" center row>
                            <SView
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 100,
                                    overflow: 'hidden',
                                    backgroundColor: `${STheme.color.card}`,
                                }}
                            >
                                <SImage src={`${e.data}?date=${new Date().getTime()}`} style={{ resizeMode: 'cover' }} />
                            </SView>
                        </SView>
                    )}
                />
                <DinamicTable.Col key={"nombre"} label="Nombre" data={e => e.row.nombres} width={200} />
                {/* <DinamicTable.Col key={"apellido"} label="Apellido" data={e => e.row.apellidos} /> */}
                <DinamicTable.Col key={"telefono"} label="Teléfono" data={e => e.row.telefono} width={120} />
                <DinamicTable.Col key={"correo"} label="Email" data={e => e.row.correo} />
                <DinamicTable.Col key={"nit"} label="NIT" data={e => e.row.nit} />
                <DinamicTable.Col key={"razon_social"} label="Razón Social" data={e => e.row.razon_social} />
                <DinamicTable.Col key={"fecha_nacimiento"} label="Fecha de Nacimiento" data={e => e.row.fecha_nacimiento} />
                <DinamicTable.Col key={"tipo_cliente"} label="Tipo" data={e => ((e.row.tipo_cliente ?? []).map(a => a.titulo))} width={160}
                    cellStyle={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        alignItems: "flex-start"
                    }}
                    customComponent={e => {
                        return (e.row.tipo_cliente ?? []).map((tc) => {
                            return <SView style={{
                                backgroundColor: STheme.colorFromText(tc.titulo) + "66",
                                borderWidth: 1,
                                borderColor: STheme.colorFromText(tc.titulo),
                                padding: 2,
                                borderRadius: 4,
                                paddingHorizontal: 4,
                            }}>
                                <SText key={tc.key} fontSize={10}  >{tc.titulo}</SText>
                            </SView>
                        })
                    }}
                />

                <DinamicTable.Col key={"habilidades"} label="Habilidades" data={e => ((e.row.habilidades ?? []).map(a => {
                    return a.descripcion
                }))} width={160}
                    cellStyle={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        alignItems: "flex-start"
                    }}
                    customComponent={e => {
                        return (e.row.habilidades ?? []).map((tc) => {
                            return <SView style={{
                                backgroundColor: STheme.colorFromText(tc.descripcion) + "66",
                                borderWidth: 1,
                                borderColor: STheme.colorFromText(tc.descripcion),
                                padding: 2,
                                borderRadius: 4,
                                paddingHorizontal: 4,
                            }}>
                                <SText key={tc.key} fontSize={10}  >{tc.descripcion}</SText>
                            </SView>
                        })
                    }}
                />

            </DinamicTable>
        </SPage>
    }
}