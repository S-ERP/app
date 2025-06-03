
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import PopupBuscaRazon from './PopupBuscaRazon';


type PopupRazonType = {
 onRegister: (e: any) => void,
 onActualizar: (e: any) => void,
 onCancel?: () => void,
 tipo?: string // ⬅️ nueva prop

}

export default class PopupRazon extends Component<PopupRazonType & { defaultData?: any }> {

 static open(props: PopupRazonType) {
  SPopup.open({
   key: "ppuprellamada",
   content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 320 }} padding={16} withoutFeedback col={"xs-11"}>
    <PopupRazon {...props} onRegister={(e) => {
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

 constructor(props) {
  super(props);
  this.state = {
   opcionesRazon: [], // ✅ Estado inicial como array
  };
 }

 async componentDidMount() {
  await this.getOptionsRazon();
 }

 time(text: string) {
  return <SView col={"xs-2.4"} style={{ padding: 4 }}>
   <SView padding={5} style={{
    backgroundColor: STheme.color.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
   }}>
    <SText fontSize={10} color={STheme.color.text} bold>{text}</SText>
   </SView>
  </SView>
 }



 getOptionsRazon = async () => {
  try {
   const all = await MDL.crm.tipoMovimientoLead.getAll();
   if (!all) return;

   const tipoSeleccionado = this.props.tipo ?? "spam"; // por defecto "spam"


   const opcionesFiltradas = Object.values(all)
    .filter(item => item.tipo === tipoSeleccionado)
    .map(item => ({
     key: item.key,
     content: item.titulo
    }));

   this.setState({ opcionesRazon: opcionesFiltradas });
  } catch (e) {
   console.error("Error al cargar opciones:", e);
  }
 }


 form: SForm | null = null;
 inputdocumento: SInput | undefined;
 popupBuscaRazon: PopupBuscaRazon | undefined;
 render() {

  const { defaultData } = this.props;

  const { opcionesRazon } = this.state;

  console.log("jajaja " + defaultData)

  return <SView center>
   <SText bold>{"Indique la razón de spam"}</SText>
   <SHr height={20} />

   <SForm row
    ref={(ref: any) => this.form = ref}
    style={{
     justifyContent: "space-between",
    }}
    inputs={{
     "key_tipoMovimientoLead": {
      col: "xs-12",
      label: "Seleccione una razón *", type: "select", autoFocus: true, required: true,
      defaultValue: defaultData?.titulo,
      options: opcionesRazon ?? [], // ✅ Se asegura que sea array
      height: 50,
     },
    }}
    onSubmit={(e: any) => {

     console.log("peru " + JSON.stringify(e))
     const data = { e };
     // const data = { ...defaultData, ...e, ...opcionesRazon, titulo: defaultData?.titulo };
     // const prom = data?.key ? MDL.crm.proyecto.editar(data) : MDL.crm.proyecto.registrar(data);
     // SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

     // prom.then((res) => {
     //  SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
     //  if (data?.key) {
     //   this.props.onActualizar?.(res);
     //  } else {
     //   this.props.onRegister?.(res);
     //  }
     //  SPopup.close("ppuprellamada");
     // }).catch((err) => {
     //  SNotification.send({ key: "registro", title: "Error", body: err, color: STheme.color.danger });
     // });

    }}
   />
   <SHr />

   <SHr height={20} />

   <SView row col={"xs-12"}>
    {this.props.onCancel && <>
     <PButtom flex type='danger' onPress={() => {
      if (this.props.onCancel) this.props.onCancel()
     }}>CANCELAR</PButtom>
     <SView width={8} />
    </>}

    <PButtom flex type="secondary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "ACEPTAR"}</PButtom>
   </SView>
  </SView >
 }
}
