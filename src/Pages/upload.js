

import React, { Component } from 'react';
import { SButtom, SHr, SImage, SInput, SPage, SText, SView, Upload } from 'servisofts-component';
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
  input: HTMLInputElement
  renderTask() {
    return Object.keys(DBUploadTask).map(k => {
      return <>
        <SUploadItem pk={k} />
        <SHr />
      </>
    })
  }

  handleSubmit() {
    if (!this.input.files[0]) return;
    const file = {
      file: this.input.files[0],
      uri: ""
    }
    console.log("ASdasd", file)
    submitFile({
      host: SSocket.api.drive + "uploadv2",
      path: "/carpeta/" + encodeURI(file?.file?.name),
      file: file
    })
    this.input.value = ""
    this.setState({ ...this.state });
  }
  render() {
    return <SPage title={"Upload"} >
      <input ref={ref => {
        this.input = ref
        if (!this.input) return
        this.input.addEventListener("change", (e) => {
          this.handleSubmit()
        })
      }}
        type='file'
        name='file'
        multiple
        accept="*/*"
        hidden
      />
      <Container>
        <SHr />
        <SText card padding={10} onPress={() => {
          this.input.click()
        }}>{"SUBIR ARCHIBO"}</SText>
        <SHr />

      </Container>
      <SView col={"xs-12"} padding={8}>
        {this.renderTask()}
      </SView>
      {/* <SView col={"xs-12"} >
        <SView width={120} height={120} card >
          <SImage src={"http://192.168.2.1:30048/carpeta/120_Screenshot%202024-04-22%20at%2018.01.14.png"} />
        </SView>
        <SView width={480} height={480} card >
          <SImage src={"http://192.168.2.1:30048/carpeta/480_Screenshot%202024-04-22%20at%2018.01.14.png"} />
        </SView>
        <SView width={720} height={720} card >
          <SImage src={"http://192.168.2.1:30048/carpeta/Screenshot%202024-04-22%20at%2018.01.14.png"} />
        </SView>
      </SView> */}
      <SHr />
    </SPage>
  }
}

