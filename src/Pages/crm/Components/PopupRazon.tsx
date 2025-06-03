
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
 tipo?: string // nueva prop
};

export default class PopupRazon extends Component<PopupRazonType & { defaultData?: any }> {

 static open(props: PopupRazonType) {
   SPopup.open({
     key: "ppuprellamada",
     content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 320 }} padding={16} withoutFeedback col={"xs-11"}>
       <PopupRazon {...props} onRegister={(e) => {
         SPopup.close("ppuprellamada");
         if (props.onRegister) props.onRegister(e);  // Pasamos los datos de vuelta al componente padre
       }} onCancel={() => {
         SPopup.close("ppuprellamada");
         if (props.onCancel) props.onCancel();
       }} />
     </SView>
   });
 }

 constructor(props) {
   super(props);
   this.state = {
     opcionesRazon: [],
   };
 }

 async componentDidMount() {
   await this.getOptionsRazon();
 }

 getOptionsRazon = async () => {
   try {
     const all = await MDL.crm.tipoMovimientoLead.getAll();
     if (!all) return;

     const tipoSeleccionado = this.props.tipo ?? "spam";  // por defecto "spam"

     const opcionesFiltradas = Object.values(all)
       .filter(item => item.tipo === tipoSeleccionado)
       .map(item => ({
         key: item.key,
         content: item.titulo,
       }));

     this.setState({ opcionesRazon: opcionesFiltradas });
   } catch (e) {
     console.error("Error al cargar opciones:", e);
   }
 };

 form: SForm | null = null;

 render() {
   const { defaultData } = this.props;
   const { opcionesRazon } = this.state;

   return (
     <SView center>
       <SText bold>Indique la razón de spam</SText>
       <SHr height={20} />

       <SForm
         row
         ref={(ref: any) => (this.form = ref)}
         style={{ justifyContent: "space-between" }}
         inputs={{
           "key_tipoMovimientoLead": {
             col: "xs-12",
             label: "Seleccione una razón *",
             type: "select",
             autoFocus: true,
             required: true,
           // defaultValue: opcionesRazon[0].key_tipoMovimientoLead,
             options: opcionesRazon ?? [],
             height: 50,
           },
         }}
         onSubmit={(e: any) => {
          // console.log("Datos del formulario:", e);  // Aquí obtienes la selección


          const selectedOption = opcionesRazon.find(option => option.key === e.key_tipoMovimientoLead);
          // console.log("Datos del formulario3:", selectedOption);  // Aquí obtienes la selección

          const data = { selectedOption }; // Puedes aquí estructurar o agregar lo que necesites

           if (this.props.onRegister) {
            this.props.onRegister(data);
           }
          // }


         }}
       />
       <SHr height={20} />

       <SView row col={"xs-12"}>
         {this.props.onCancel && (
           <>
             <PButtom flex type="danger" onPress={() => this.props.onCancel && this.props.onCancel()}>
               CANCELAR
             </PButtom>
             <SView width={8} />
           </>
         )}

         <PButtom
           flex
           type="secondary"
           onPress={() => {
             console.log("Submitting form...");
             this.form?.submit();  // Llamar al submit del formulario
           }}
         >
           {defaultData ? "ACTUALIZAR" : "ACEPTAR"}
         </PButtom>
       </SView>
     </SView>
   );
 }
}