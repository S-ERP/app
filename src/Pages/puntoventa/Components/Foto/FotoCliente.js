import React, { Component } from 'react';
import { SView, SText, STheme, SImage } from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';
import PopupCliente from '../Carrito/PopupCliente';

export default class FotoCliente extends Component {
  state = {
    cliente: null,
  };

  handleSelectCliente = () => {
    PopupCliente.open({
      onReloadCliente: (cliente) => {
        this.setState({ cliente });
        this.props.onReloadCliente?.(cliente);
      },
    });
  };

  render() {
    const { cliente } = this.state;
    const style_text = {
      color: STheme.color.text,
      fontSize: 12,
      fontWeight: 'bold',
    };
    const url = cliente?.key ? `${SSocket.api.crm}cliente/${cliente.key}` : null;

    return (
      <SView
        center
        row
        backgroundColor={STheme.color.darkGray}
        style={{ height: 38, borderRadius: 2, margin: 2 }}
      >
        <SView
          center
          col={'xs-12'}
          row
          onPress={this.handleSelectCliente}
        >
          <SView center col={'xs-5'}>
            <SView
              center
              backgroundColor={STheme.color.background}
              style={{
                minWidth: 10,
                width: 30,
                minHeight: 10,
                height: 30,
                borderRadius: 18,
                margin: 4,
                marginRight: cliente?.key ? 6 : 14,
                overflow: 'hidden',
              }}
            >
              {!cliente?.key ? (
                <SIconApp name="profile2" width={20} fill={STheme.color.text} />
              ) : (
                <SImage src={url} style={{ resizeMode: 'cover' }} />
              )}
            </SView>
          </SView>
          <SView flex center>
            <SText style={{ ...style_text, fontSize: 12 }}>
              {cliente?.nombres || 'CLIENTE'}
            </SText>
            {cliente?.key ? (
              <SText
                style={{
                  ...style_text,
                  fontSize: 12,
                  color: '#26e9aeff',
                  textTransform: 'uppercase',
                }}
              >
                CLIENTE
              </SText>
            ) : null}
          </SView>
        </SView>
      </SView>
    );
  }
}