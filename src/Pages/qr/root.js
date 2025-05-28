import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SMath, SPage, STheme } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import Model from '../../Model';

export default class root extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async loadData() {
    const resp = await SSocket.sendPromise({
      component: "solicitud_qr",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    })
    return Object.values(resp.data);
  }
  render() {
    return <SPage title={"QR"} disableScroll>
      <DinamicTable
        loadData={this.loadData.bind(this)}
        loadInitialState={async () => {
          return {
            sorters: [
              { key: "fecha_on", order: "desc", type: "date" },
            ]
          }
        }}
        language='es'
        selectType='single'
      >
        <DinamicTable.Col
          key="key"
          label='ID'
          width={50}
          data={a => a?.row?.key}
        />
        <DinamicTable.Col
          key="qrid"
          label='qrid'
          width={50}
          data={a => a?.row?.qrid}
        />
        <DinamicTable.Col
          key="fecha_on"
          label='Fecha'
          width={150}
          dataType='date'
          data={a => !a?.row?.fecha_on ? null : new SDate(a?.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
          cellStyle={{
            alignItems: "flex-end",
          }}
          textStyle={{
            fontSize: 12
          }}
          dateFormat={"HH - dd MON yyyy"}
        />

        <DinamicTable.Col
          key="estado"
          label='Estado'
          width={100}
          data={a => {
            if (a.row.fecha_pago) {
              return "pagado"
            }
            if (new SDate().isBefore(new SDate(a.row.fecha_vencimiento))) {
              return "pendiente"
            }
            return "vencido"
          }
          }
          cellStyle={{
            alignItems: "center",
          }}
          textStyle={{
            fontSize: 10,
            fontWeight: "bold",
            color: STheme.color.white
          }}
          customComponent={a => {
            let color = STheme.color.lightGray;
            switch (a.data) {
              case "pagado":
                color = STheme.color.success;
                break;
              case "pendiente":
                color = STheme.color.warning;
                break;
              case "vencido":
                color = STheme.color.danger;
                break;
            }

            return <View style={{
              padding: 3,
              backgroundColor: color,
              borderRadius: 4,
            }}>
              <Text style={[a.textStyle]}>{(a.data + "").toUpperCase()}</Text>
            </View>
          }}

        />
        <DinamicTable.Col
          key="tipo"
          label='tipo'
          width={70}
          data={a => a?.row?.tipo}
          cellStyle={{
            alignItems: "center",
            fontWeight: "bold"
          }}
        />
        <DinamicTable.Col
          key="monto"
          label='monto'
          width={100}
          dataType='number'
          data={a => a?.row?.monto}
          cellStyle={{
            alignItems: "flex-end",
            paddingRight: 8
          }}
          textStyle={{
            fontWeight: "bold"

          }}
          format={a => SMath.formatMoney(a.data ?? 0, 2)}
        />

        <DinamicTable.Col
          key="descripcion"
          label='descripcion'
          width={200}
          textStyle={{
            fontSize: 12
          }}
          data={a => a?.row?.descripcion}
        />
        <DinamicTable.Col
          key="nit"
          label='nit'
          width={100}
          textStyle={{
            fontSize: 12
          }}
          data={a => a?.row?.nit}
        />
        <DinamicTable.Col
          key="razon_social"
          label='razon_social'
          width={100}
          textStyle={{
            fontSize: 12
          }}
          data={a => a?.row?.razon_social}
        />
        <DinamicTable.Col
          key="telefono"
          label='telefono'
          width={100}
          textStyle={{
            fontSize: 12
          }}
          data={a => a?.row?.telefono}
        />
        <DinamicTable.Col
          key="correos"
          label='correos'
          width={100}
          textStyle={{
            fontSize: 12
          }}
          data={a => a?.row?.correos}
        />


        <DinamicTable.Col
          key="fecha_vencimiento"
          label='Fecha de vencimiento'
          width={150}
          dataType='date'
          data={a => !a?.row?.fecha_vencimiento ? null : new SDate(a?.row?.fecha_vencimiento, "yyyy-MM-ddThh:mm:ss").date}
          cellStyle={{
            alignItems: "flex-end",
          }}
          textStyle={{
            fontSize: 12
          }}
          dateFormat={"HH - dd MON yyyy"}
        />
        <DinamicTable.Col
          key="fecha_pago"
          label='Fecha del pago'
          width={150}
          dataType='date'
          data={a => !a?.row?.fecha_pago ? null : new SDate(a?.row?.fecha_pago, "yyyy-MM-ddThh:mm:ss").date}
          cellStyle={{
            alignItems: "flex-end",
          }}
          textStyle={{
            fontSize: 12
          }}
          dateFormat={"HH - dd MON yyyy"}
        />
        <DinamicTable.Col
          key="callback"
          label='callback'
          width={100}
          textStyle={{
            fontSize: 12
          }}
          data={a => a?.row?.callback}
        />
      </DinamicTable>
    </SPage>
  }
}
