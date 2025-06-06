
import React, { Component } from 'react';
import MDL from '../../../MDL';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type PopupRazonType = {
 onRegister: (e: any) => void,
 onActualizar: (e: any) => void,
 onCancel?: () => void,
 tipo?: string // tipo por defecto: "spam", "fuera_perfil", etc.
};

export default class PopupRazon extends Component<PopupRazonType & { defaultData?: any }> {
 static open(props: PopupRazonType) {
  SPopup.open({
   key: "ppuprellamada",
   content: (
    <SView
     backgroundColor={STheme.color.background}
     style={{ borderRadius: 8, maxWidth: 320 }}
     padding={16}
     withoutFeedback
     col={"xs-11"}
    >
     <PopupRazon
      {...props}
      onRegister={(e) => {
       SPopup.close("ppuprellamada");
       props.onRegister?.(e);
      }}
      onCancel={() => {
       SPopup.close("ppuprellamada");
       props.onCancel?.();
      }}
     />
    </SView>
   )
  });
 }

 constructor(props) {
  super(props);
  this.state = {
   motivosLead: [],
  };
 }

 form: SForm | null = null;

 async componentDidMount() {
  await this.loadMotivosLead();
 }

 loadMotivosLead = async () => {
  try {
   const all = await MDL.crm.tipoMovimientoLead.getAll();
   if (!all) return;

   const tipoSeleccionado = this.props.tipo;

   const motivosFiltrados = Object.values(all)
    .filter(item => item.tipo === tipoSeleccionado)
    .map(item => ({
     key: item.key,
     content: item.titulo,
    }));

   const motivosConDefault = [
    { key: "", content: "--" },
    ...motivosFiltrados
   ];

   this.setState({ motivosLead: motivosConDefault });
  } catch (e) {
   console.error("Error al cargar motivos:", e);
  }
 };

 render() {
  const { defaultData } = this.props;
  const { motivosLead } = this.state;

  return (
   <SView center>
    <SText bold>Indique la razón de {this.props.tipo}</SText>
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
       options: motivosLead,
       height: 50,
       onChange: (value) => {
        console.log("Seleccionado", value);
        // SPopup.close("ppuprellamada");
       }
      },
     }}
     onSubmit={(formData: any) => {
      const selectedOption = motivosLead.find(
       option => option.key === formData.key_tipoMovimientoLead
      );
      const data = { selectedOption };
       this.props.onRegister?.(data);
     }}
    />

    <SHr height={20} />

    <SView row col={"xs-12"}>
     {this.props.onCancel && (
      <>
       <PButtom flex type="danger" onPress={this.props.onCancel}>
        CANCELAR
       </PButtom>
       <SView width={8} />
      </>
     )}

     <PButtom flex type="secondary" onPress={() => this.form?.submit()}>
      {defaultData ? "ACTUALIZAR" : "ACEPTAR"}
     </PButtom>
    </SView>
   </SView>
  );
 }
}
