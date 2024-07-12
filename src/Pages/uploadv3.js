import React, { Component } from 'react';
import { SButtom, SHr, SInput, SPage, SText, SView, Upload } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { Container } from '../Components';
import { UploadTask, DBUploadTask, submitFile } from '../Components/SUpload';
import SUploadItem from '../Components/SUpload/SUploadItem';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  renderTask() {
    return Object.keys(DBUploadTask).map(k => {
      return <SUploadItem pk={k} />
    })
  }
  render() {
    return <SPage title={"Upload"} disableScroll>
      <SInput
        type='files'
        style={{
          height: 200,
        }}
        placeholder={"SUELTE LOS ARCHIBOS "}
        onChangeText={(e) => {
          console.log(e);
          for (let i = 0; i < e.length; i++) {
            submitFile({
              host: SSocket.api.root + "uploadv2",
              path: "/carpeta/" + e[i]?.file?.name,
              file: e[i]
            });

            // uploadTask.start();
          }
          this.setState({ ...this.state })


        }} />
      {this.renderTask()}
    </SPage>
  }
}

