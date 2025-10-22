import React, { Component } from 'react';
import { SButtom, SHr, SInput, SPage, SText, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { Container } from '../Components';
import * as SUpload from '../Components/SUpload';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  sendPromise({ file }, url) {
    return new Promise(async (resolve, reject) => {
      if (!file) reject("file not found");
      if (!file.type) reject("file.type not found");
      var formData = new FormData();
      formData.append('file', file);

      var request = new XMLHttpRequest();
      request.open('POST', url, true);
      // request.setRequestHeader("Upload-ID", "123")
      request.upload.addEventListener('progress', function (e) {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          console.log(percentComplete)
        }
      });
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.readyState === 4 && request.status === 200) {
            console.log("exito")
            resolve(request.response);
          } else {
            console.log("onreadystatechange", request.statusText)
          }
        }
      }
      request.send(file);
      // request.send(formData);

    })

  }

  render() {
    return <SPage title={"Upload"} disableScroll>
      <Container>
        <SInput
          type='files'
          style={{
            height: 500,
          }}
          placeholder={"SUELTE LOS ARCHIBOS "}
          onChangeText={(e) => {
            console.log(e)
            this.files = e;
          }} />

        <SButtom type='danger' onPress={async () => {
          for (let i = 0; i < this.files.length; i++) {
            SUpload.submitFile({
              host: SSocket.api.root + "uploadv2",
              path: "/carpeta/" + this.files[i]?.file?.name,
              file: this.files[i]
            })
            // this.sendPromise(this.files[i], SSocket.api.drive + "subir/carpeta/" + this.files[i]?.file?.name)
            // this.sendPromise(this.files[i],"http://192.168.2.1:8081/upload/carpeta/" + this.files[i]?.file?.name)
          }
        }}>hola ricky</SButtom>
        <SHr />
        <SButtom type='danger' onPress={async () => {
          for (let i = 0; i < this.files.length; i++) {
            this.sendPromise(this.files[i], SSocket.api.drive + "subir/carpeta/" + this.files[i]?.file?.name)
            // this.sendPromise(this.files[i],"http://192.168.2.1:8081/upload/carpeta/" + this.files[i]?.file?.name)
          }
        }}>hola GERRARDO</SButtom>
        <SHr />
        <SButtom type='danger' onPress={async () => {
          for (let i = 0; i < this.files.length; i++) {
            // this.sendPromise(this.files[i], SSocket.api.root + "uploadv2/carpeta/" + this.files[i]?.file?.name)
            this.sendPromise(this.files[i], "http://192.168.2.1:8081/upload")
          }
        }}>hola RUDDY</SButtom>

      </Container>
    </SPage>
  }
}

