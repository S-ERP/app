import { Text, TouchableOpacity } from 'react-native'
import React, { Component } from 'react'
import { STheme, SView,SPage, SHr, SForm } from 'servisofts-component'

const botones = [
  { label: "Botón 1", screen: "Confirmado" },
  { label: "Botón 2", screen: "Cancelado" },
  { label: "Botón 3", screen: "Double" },
  { label: "Botón 4", screen: "Spam" },
  { label: "Botón 5", screen: "Recall" },
  { label: "Botón 6", screen: "Failed Call" },
]
const multiformularios = [
  { label: "Multiformulario 1", screen: "Detalles de la orden" },
  { label: "Multiformulario 2", screen: "Productos" },
  { label: "Multiformulario 3", screen: "Adicional" },
]

export class detalleLlamada extends Component {

  render() {
    return (
       
      <SView style={{ borderWidth: 1, borderColor: "red", width: "100%", height: "100%" }}>
        <SView col={"xs-12"} style={{ height: 50, borderWidth: 1, borderColor: "blue", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "white" }}>Detalle Llamada</Text>
        </SView>

        <SView col={"xs-12"} style={{ flexDirection: "row", height: 70, borderWidth: 1, borderColor: "blue", justifyContent: "center", alignItems: "center" }}>
          {botones.map((btn, i) => (
            <TouchableOpacity
              key={i}
              style={{
                width: "9%",
                height: "50%",
                borderWidth: 1,
                borderColor: STheme.color.gray,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 10
              }}
            >
              <Text style={{ color: "white" }}>{btn.screen}</Text>
            </TouchableOpacity>
          ))}
        </SView>
        <SView col={"xs-12"} style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "blue" }}>
          <SView
            col={"xs-5"}
            card
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "green",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SView col={"xs-12"} style={{ height: 50, borderWidth: 1, borderColor: "blue", justifyContent: "center", alignItems: "center",position: "absolute", top: 0, left: 0, right: 0 }}>
                <Text style={{ color: "white" }}>Horario y id de la orden</Text>
            </SView>
            <SHr height={40} />
            <SView col={"xs-12"} style={{ flexDirection: "row", height: 50, borderWidth: 1, borderColor: "red", justifyContent: "center", alignItems: "center",position: "absolute", top: 50, left: 0, right: 0 }}>
                {multiformularios.map((form, i) => (
                    <TouchableOpacity
                      key={i}
                      style={{
                        width: "26%",
                        height: "50%",
                        borderWidth: 1,
                        borderColor: STheme.color.gray,
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        marginHorizontal: 1
                      }}
                    >
                      <Text style={{ color: "white" }}>{form.screen}</Text>
                    </TouchableOpacity>
                  ))}
            </SView>
            <SHr height={40} />

            <SView col={"xs-12"} style={{ height: "80%", borderWidth: 1, borderColor: "blue", justifyContent: "center", alignItems: "center"}}>
                <SForm
                    col={"xs-12"}
                    style={{ padding: 10 }}
                    inputProps={{
                    style: {
                        width: "100%",
                        height: 40,
                    
                        borderColor: STheme.color.gray,
                        borderRadius: 8,
                        
                    },
                    }}
                    inputs={{
                    nombre: { label: "Nombre", isRequired: true },
                    telefono: { label: "Teléfono", isRequired: true },
                    email: { label: "Email", isRequired: false },
                    }}
                />

            </SView>
          </SView>
          <SView
            col={"xs-5"}
            card
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "green",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Contenido Card 2 */}
          </SView>
          <SView
            col={"xs-5"}
            card
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "green",
              justifyContent: "center",
              alignItems: "center",
            }}
          >

          </SView>
        </SView>
      </SView>
  
    )
  }
}

export default detalleLlamada