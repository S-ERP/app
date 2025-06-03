import React, { Component } from 'react';
import {
 SIcon,
 SLoad,
 SNotification,
 SPage,
 SText,
 STheme,
 SView,
} from 'servisofts-component';
import MDL from '../../MDL';
import Model from '../../Model';

export default class tipoMovimientoLead extends Component {
 constructor(props) {
  super(props);
  this.state = {
   data_tipoMovimientoLead: null,
   error: null,
  };
 }

 componentDidMount() {
  MDL.crm.tipoMovimientoLead
   .getAll()
   .then((res) => {
    this.setState({ data_tipoMovimientoLead: res });
   })
   .catch((err) => {
    console.error('Error al cargar tipoMovimientoLead:', err);
    SNotification.send({
     title: 'Error',
     body: 'No se pudo cargar tipoMovimientoLead.',
     color: STheme.color.danger,
    });
    this.setState({ error: err });
   });
 }

 render() {
  const { data_tipoMovimientoLead, error } = this.state;

  if (error) {
   return (
    <SPage title="tipo de movimiento" disableScroll>
     <SView center>
      <SText color={STheme.color.danger}>
       Error al cargar los datos.
      </SText>
     </SView>
    </SPage>
   );
  }

  if (!data_tipoMovimientoLead) return <SLoad />;

  return (
   <SPage
    title="tipo de movimiento"
    icon={<SIcon name="empresa" fill={STheme.color.text} />}
    disableScroll
   >
    <SView padding={16}>
     <SText>Datos recibidos:</SText>
     <SView
      style={{
       backgroundColor: STheme.color.card,
       padding: 8,
       borderRadius: 8,
       marginTop: 8,
      }}
     >
      <SText fontSize={10} selectable>
       {JSON.stringify(data_tipoMovimientoLead, null, 2)}
      </SText>
     </SView>
    </SView>
   </SPage>
  );
 }
}
