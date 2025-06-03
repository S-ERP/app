import React from "react";
import { SHr, SIcon, SPage, SText, SThread, SView } from "servisofts-component";
import SIP from "../../../Components/SIP";
import { RTCSession } from "jssip/lib/RTCSession";

export default class Llamada extends React.Component<{
  phone: string;
}> {
  llamada: RTCSession | null = null;
  handlePress = () => {
    if (!this.llamada) {
      const sip = new SIP();
      this.llamada = sip.call(this.props.phone, (e: any, evt: any) => {
        console.log("Evento de llamada:", e, evt);
      });
      this.forceUpdate();
    } else {
      this.llamada.terminate();
      this.llamada = null;
      this.forceUpdate();
    }
    // console.log(this.llamada?.)
  };
  isRun = true;
  componentDidMount() {
    this.isRun = true;
    this.hilo();
  }
  componentWillUnmount() {
    this.isRun = false;
    if (this.llamada) {
      this.llamada.terminate();
      this.llamada = null;
    }
  }
  hilo() {
    new SThread(1000, "new", false).start(() => {
      if (!this.isRun) return;
      if (this.llamada) {
        this.forceUpdate();
      }
      this.hilo();
    });
  }

  rendera_2() {
    return (
      <>
        {/* <SPage disableScroll hidden> */}
          {/* <SView col="xs-12" row center>
            <SView col="xs-3.5" row center>
              <SView width={160} center style={{ borderColor: "white", borderRadius: 48, borderWidth: 6, backgroundColor: "#8CB1F8" }}>
                <SView col="xs-12" row center>
                  <SView col="xs-7" row center>
                    <SView col="xs-9" row>
                      <SText color="#1D252D">Conectando.</SText>
                      <SText color="#1D252D" bold>
                        00:00:00
                      </SText>
                    </SView>
                  </SView>
                  <SView col="xs-5" row center>
                    <SView width={28} height={28} row style={{ borderRadius: 8, backgroundColor: "#FFFFFF" }} />
                  </SView>
                </SView>
              </SView>
            </SView>
          </SView>
          <SHr height={10} />
          <SView col="xs-12" row center>
            <SView col="xs-3.5" row center>
              <SView width={180} center style={{ borderColor: "white", borderRadius: 48, borderWidth: 6, backgroundColor: "#8CB1F8" }}>
                <SView col="xs-12" row center>
                  <SView col="xs-3" row center>
                    <div className="outer-circle">
                      <div className="inner-circle"></div>
                    </div>
                  </SView>
                  <SView col="xs-6" row center>
                    <SView col="xs-9" row>
                      <SText color="#1D252D">Llamando.</SText>
                      <SText color="#1D252D" bold>
                        00:00:00
                      </SText>
                    </SView>
                  </SView>
                  <SView col="xs-3" row center>
                    <SView width={28} height={28} row center style={{ borderRadius: 8, backgroundColor: "#FFFFFF" }}>
                      <SIcon name="microfono" fill="#1D252D" height={18} />
                    </SView>
                  </SView>
                </SView>
              </SView>
            </SView>
          </SView>
          <SHr height={10} /> */}

          <SView col="xs-12" row center>
            <SView col="xs-3.5" row center>
              <SView width={320} center style={{ borderColor: "white", borderRadius: 48, borderWidth: 6, backgroundColor: "#A0F21F" }}>
                <SView col="xs-12" row center>
                  <SView col="xs-5" row center>
                    <SView col="xs-8" row>
                      <SText color="#1D252D">Cliente en linea.</SText>
                      <SText color="#1D252D" bold>
                        00:00:00
                      </SText>
                    </SView>
                  </SView>
                  <SView col="xs-2" row center border={"transparent"}>
                    <SView width={28} height={28} row center style={{ borderRadius: 8, backgroundColor: "#FFFFFF" }}>
                      <SIcon name="microfono" fill="#1D252D" height={18} />
                    </SView>
                  </SView>
                  <SView col="xs-5" row center border={"transparent"}>
                    <SView col="xs-12" row>
                      <SView width={120} height={28} row center style={{ borderRadius: 8, backgroundColor: "#1B242C" }}>
                        <SText color="white" fontSize={12} bold>
                          Finalizar llamada
                        </SText>
                      </SView>
                    </SView>
                  </SView>
                </SView>
              </SView>
            </SView>
          </SView>
        {/* </SPage> */}
      </>
    );
  }

  render() {
      return <SView onPress={this.handlePress.bind(this)}>
          {!this.llamada && <SText>{"LLAMAR"}</SText>}
          {/* {this.llamada && <SText>{"COLGAR" + " " + this.llamada?.start_time+ "DDD"}</SText>} */}
          {this.llamada && <SText>{"COLGAR" + " "}</SText>}
          <SText >{this.props.phone}</SText>
      </SView>
  }
}
