import React, { Component } from 'react';
import { SPage, SView, SInput, SHr, SText, SButtom } from 'servisofts-component';
import { Container } from '../Components';

export default class FileUploaderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [], // Lista de archivos seleccionados
    };
  }

  handleFileChange = (files) => {
    console.log("Archivos cargados:", files);
    this.files = files;

    // Limpia el input de archivos si existe
    if (this.fileInput?.input) {
      this.fileInput.input.value = "";
    }

    this.setState({});
  };

  removeFile = (index) => {
    console.log("Eliminando archivo en posición:", index);
    if (!this.files || this.files.length === 0) return;

    this.files.splice(index, 1);
    this.setState({});
    this.files = [];
  };

  removeAllFiles = () => {
    if (!this.files) return;
    // Recorremos al revés para evitar problemas con splice e índices
    for (let i = this.files.length - 1; i >= 0; i--) {
      this.files.splice(i, 1);
    }
    this.setState({});
  };


  render() {
    return (
      <SPage title="Subida de Archivos" disableScroll>
        <Container>
          <SInput
            ref={(ref) => (this.fileInput = ref)}
            type="files"
            style={{ height: 150, borderWidth: 1, borderColor: '#ccc', padding: 8, }}
            placeholder="Suelte los archivos aquí"
            onChangeText={this.handleFileChange}
          />

          <SHr height={20} />

          {this.files && this.files.length > 0 && (
            <SView>
              <SView row center> <SButtom type="danger" onPress={() => this.removeAllFiles()} style={{ marginLeft: 8 }} > Eliminar Todo</SButtom> </SView>

              {this.files.map((fileObj, index) => (
                <SView key={index} row center>
                  <SText> {fileObj.file?.name || fileObj.name || `Archivo ${index + 1}`} </SText>
                  <SButtom type="danger" onPress={() => this.removeFile(index)} style={{ marginLeft: 8 }} > Eliminar </SButtom>
                </SView>
              ))}
              <SHr />
            </SView>
          )}
        </Container>
      </SPage>
    );
  }
}
