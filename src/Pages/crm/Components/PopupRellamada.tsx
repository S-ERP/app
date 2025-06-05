
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SDate, SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type PopupRellamadaType = {
 onRegister: (e: any) => void,
 onActualizar: (e: any) => void,
 onCancel?: () => void,
}

const now = new SDate(); // Hora actual


export default class PopupRellamada extends Component<PopupRellamadaType & { defaultData?: any }> {
 static open(props: PopupRellamadaType) {
  SPopup.open({
   key: "ppuprellamada",
   content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 320 }} padding={16} withoutFeedback col={"xs-11"}>
    <PopupRellamada {...props} onRegister={(e) => {
     SPopup.close("ppuprellamada")
     if (props.onRegister) props.onRegister(e)
    }}
     onCancel={() => {
      SPopup.close("ppuprellamada")
      if (props.onCancel) props.onCancel()
     }}
    />
   </SView>
  })
 }

 time(text: string) {
  return <SView col={"xs-2.4"} style={{ padding: 4 }}>
   <SView padding={5} style={{
    backgroundColor: STheme.color.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
   }}
    onPress={() => {
     let date = new SDate();

     // Detecta si es minutos u horas
     if (text.includes("min")) {
      const minutos = parseInt(text.split(" ")[0]);
      date.addMinute(minutos);
     } else if (text.includes("hrs")) {
      const horas = parseInt(text.split(" ")[0]);
      date.addHour(horas);
     }

     const nuevaHora = date.toString("hh:mm");

     // Actualiza el campo en el formulario
     // if (this.form) {
     // }
     this.form.setValue("tiempo_cliente", nuevaHora);
     console.log("dddddddddd "+nuevaHora)
    // }}

    }} >

    <SText fontSize={10} color={STheme.color.text} bold>{text}</SText>
   </SView>
  </SView>
 }

 form: SForm | null = null;
 render() {

  const { defaultData } = this.props;


  return <SView center>
   <SText bold>{defaultData ? "Editar Proyecto" : "Fecha de hora de rellamada"}</SText>
   <SHr height={20} />
   <SView row>
    <SText justify fontSize={12} color={STheme.color.text} bold style={{ textAlign: "center" }}>
     La rellamada solo se coloca a petición
    </SText>
    <SText fontSize={12} color={STheme.color.text} style={{ textAlign: "center" }}>
     En otros casps utilice botón "Llamada fallida"
    </SText>
    <SText justify fontSize={12} color={STheme.color.text} bold style={{ textAlign: "center" }}>
     Programar rellamadas no más de 1d 0h
    </SText>
   </SView>
   <SHr height={15} />
   <SView col={"xs-12"} row>
    {this.time("10 min")}
    {this.time("20 min")}
    {this.time("30 min")}
    {this.time("1 hrs")}
    {this.time("2 hrs")}
   </SView>

   <SForm row
    ref={(ref: any) => this.form = ref}
    style={{
     justifyContent: "space-between",
    }}
    inputs={{
     "fecha": {
      col: "xs-5.8",
      label: "Fecha *", type: "date", autoFocus: true, required: true, defaultValue: (new SDate().toString("yyyy-MM-dd"))
      , onSubmitEditing: () => {
       if (this.form) this.form.focus("tiempo_cliente");
      }
     },
     "tiempo_cliente": {
      col: "xs-5.8",
      label: "Tiempo de cliente *", type: "hour", required: true,
      // defaultValue: now.toString("hh:mm"), onSubmitEditing: () => {
      //  if (this.form) this.form.submit();
      // }
     },
     "comentario": {
      col: "xs-12",
      label: "Comentario", type: "textArea", defaultValue: defaultData?.descripcion, onSubmitEditing: () => {
       if (this.form) this.form.submit();
      }
     },
     "fijar": {
      col: "xs-12",
      label: "¿Fijar la llamada?", type: "checkBox", defaultValue: defaultData?.descripcion, onSubmitEditing: () => {
       if (this.form) this.form.submit();
      }
     }
    }}
    onSubmit={(e: any) => {

     const data = { ...defaultData, ...e };
     const prom = data?.key ? MDL.crm.proyecto.editar(data) : MDL.crm.proyecto.registrar(data);

     SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

     prom.then((res) => {
      SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
      if (data?.key) {
       this.props.onActualizar?.(res);
      } else {
       this.props.onRegister?.(res);
      }
      SPopup.close("ppuprellamada");
     }).catch((err) => {
      SNotification.send({ key: "registro", title: "Error", body: err, color: STheme.color.danger });
     });

     // MDL.crm.proyecto.registrar(e).then((e: any) => {
     //     SNotification.send({
     //         key: "registro",
     //         title: "Registrado con exito",
     //         color: STheme.color.success,
     //         time: 5000,
     //     })
     //     if (this.props.onRegister) this.props.onRegister(e)
     // }).catch((e: any) => {
     //     SNotification.send({
     //         key: "registro",
     //         title: "Error al registrar",
     //         body: e,
     //         color: STheme.color.danger,
     //         time: 5000,
     //     })
     // })

    }}
   />
   <SHr />
   <SView row col={"xs-12"}>
    {this.props.onCancel && <>
     <PButtom flex type='danger' onPress={() => {
      if (this.props.onCancel) this.props.onCancel()
     }}>CANCELAR</PButtom>
     <SView width={8} />
    </>}

    <PButtom flex type="secondary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "ACEPTAR"}</PButtom>

    {/* <PButtom flex type='primary' onPress={() => {
                    if (this.form) this.form.submit();
                }}>CREAR</PButtom> */}
   </SView>
  </SView >
 }
}
