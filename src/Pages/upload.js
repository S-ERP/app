import React, { Component } from 'react';
import { SButtom, SInput, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    
    sendServer=async(file)=>{
        if (file) {
            file = file.file;
            // Crear una instancia de FormData para enviar el archivo
            var formData = new FormData();
            formData.append('component', "file");
            formData.append('type', "registro");
            formData.append('data', JSON.stringify({fecha:new Date(file.lastModified)}));
      
            // Crear una nueva solicitud XMLHttpRequest
            var xhr = new XMLHttpRequest();
      
            // Configurar la solicitud
            xhr.open('POST', SSocket.api.root+"upload/", true);
      
            // Establecer eventos para capturar el progreso
            xhr.upload.onprogress = function(e) {
              if (e.lengthComputable) {
                var percentComplete = (e.loaded / e.total) * 100;
                console.log('Progress: ' + percentComplete + '%');
                console.log(e.loaded +"/"+ e.total);
              }
            };
      
            // Configurar una función para manejar la respuesta del servidor
            xhr.onload = function() {
              if (xhr.status === 200) {
                
                console.log('OK 200');
                
              } else {
                console.log('Error al subir el archivo');
              }
            };
      
            // Enviar el formulario con el archivo
            xhr.send(formData);
          } else {
            console.log('Por favor selecciona un archivo primero.');

          }
    };

    render() {
        return <SPage title={"Upload"} disableScroll>
            <SInput
                type='files'
                style={{
                    height:50,
                }}
                placeholder={"SUELTE LOS ARCHIBOS "}
                onChangeText={(e) => {
                    console.log(e)
                    this.files = e;
                }} />
                
                <SButtom type='danger' onPress={async()=>{
                    console.log(this.files);
                    for(let i=0; i<this.files.length; i++){
                        await this.sendServer(this.files[i])
                    }
                    
                }}>hola</SButtom>
                
            
        </SPage>
    }
}
