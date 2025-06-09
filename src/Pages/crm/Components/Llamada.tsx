import React from "react";
import { SHr, SIcon, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import SIP from "../../../Components/SIP";
import { RTCSession } from "jssip/lib/RTCSession";
import { View } from "react-native";
import DraggableView from "../call/DragableView";
import SIconApp from "../../../Assets/SIconApp";

export default class Llamada extends React.Component<{
  phone?: string;
}> {
  llamada: RTCSession | null = null;
  state = {
    estado: "",
  }
  evt: any = null;
  llamar = (phone: string) => {
    // if (!this.llamada) {
    const sip = SIP.getInstance();
    this.llamada = sip.call(phone, (e: any, evt: any) => {
      console.log("Evento de llamada:", e, evt);
      this.evt = evt;
      this.setState({ estado: e });
      if (e == "ended") {
        this.llamada = null;
        this.forceUpdate();
      }

    });

    this.state.estado = "connecting";
    // this.llamada.on("ended", (e: any) => {
    //   this.llamada = null;
    //   this.setState({ estado: "ended" });
    // });

    // this.llamada.unmute();
    this.forceUpdate();
    // } else {
    //   this.llamada.terminate();
    //   this.llamada = null;
    //   this.forceUpdate();
    // }
    // console.log(this.llamada?.)
  };

  colgar = () => {
    if (!this.llamada) return;
    this.llamada.terminate();
    this.llamada = null;
    this.forceUpdate();
  }
  isRun = true;
  componentDidMount() {
    SIP.getInstance();
    this.isRun = true;
    // this.hilo();
  }
  componentWillUnmount() {
    this.isRun = false;
    if (this.llamada) {
      if (this.llamada.isEnded()) {
        this.llamada = null;
        // this.forceUpdate();
        return;
      }
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


  renderFailed() {
    return <View style={{
      top: 4,
      width: 180,
    }}>
      <DraggableView style={{
        // top: 50,
        // left: "50%",
        width: "100%",
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: STheme.color.text,
        backgroundColor: STheme.color.danger,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }} >
        <SView flex>
          <SText>{this.evt.cause}</SText>
          <SText fontSize={8}>{this.evt?.message?.reason_phrase}</SText>

        </SView>
        <SView width={20} height={20} onPress={() => {
          this.llamada = null;
          this.forceUpdate();
          return;
        }}>
          <SIconApp name="Close" fill={STheme.color.text} />
        </SView>


      </DraggableView>
    </View>
  }
  renderConnecting() {
    return <View style={{
      top: 4,
      width: 180,
    }}>
      <DraggableView style={{
        // top: 50,
        // left: "50%",
        width: "100%",
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: STheme.color.text,
        backgroundColor: "#799DF8",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }} >
        <SView flex>
          <SText>{"Conectando..."}</SText>
          <SText fontSize={8}>{"00:00:00"}</SText>

        </SView>
        <SView width={20} height={20} onPress={() => {
          console.log(this.llamada?.isMuted())
          // this.llamada = null;
          // this.forceUpdate();
          return;
        }}>
          <SIconApp name="microfono" fill={STheme.color.text} />
        </SView>

      </DraggableView>
    </View>
  }
  renderEnLinea() {
    return <View style={{
      top: 4,
      width: 180,
    }}>
      <DraggableView style={{
        // top: 50,
        // left: "50%",
        width: "100%",
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: STheme.color.text,
        backgroundColor: "#B0F333",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }} >
        <SView flex>
          <SText>{"Conectando..."}</SText>
          <SText fontSize={8}>{"00:00:00"}</SText>

        </SView>
        <SView width={20} height={20} onPress={() => {
          if (!this.llamada) return;
          try {
            if (this.llamada.isMuted().audio) {
              console.log("Unmuting audio...");
              this.llamada.unmute("audio");
            } else {
              console.log("Muting audio...");
              this.llamada.mute("audio");
            }
          } catch (err) {
            console.error("Error al mutear/desmutear:", err);
          }
          // this.llamada = null;
          // this.forceUpdate();
          return;
        }}>
          <SIconApp name="microfono" fill={STheme.color.text} />
        </SView>
        <SView width={20} height={20} onPress={() => {
          if (!this.llamada) return;
          this.llamada.terminate();
          this.llamada = null;
          this.forceUpdate();
        }}>
          <SIconApp name="Close" fill={STheme.color.text} />
        </SView>

      </DraggableView>
    </View>
  }

  render() {

    if (!this.llamada) return null;
    let color = STheme.color.success;
    if (["failed"].includes(this.state.estado)) {
      return this.renderFailed();
    }
    if (["connecting"].includes(this.state.estado)) {
      return this.renderConnecting();
    }
    if (["accepted"].includes(this.state.estado)) {
      return this.renderEnLinea();
    }
    return <View style={{
      top: 4,
      width: 180,
    }}>
      <DraggableView style={{
        // top: 50,
        // left: "50%",
        width: "100%",
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: STheme.color.text,
        backgroundColor: color,
      }} >
        <SText>{this.state.estado}</SText>


      </DraggableView>
    </View>
    return <SView>
      <SText onPress={() => {
        const sip = SIP.getInstance();
      }}>{"RECONET"}</SText>
      <SView width={150} center height={50} onPress={this.handlePress.bind(this)} row style={{
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1B242C",
      }}>

        {!this.llamada && <SText>{"LLAMAR"}</SText>}
        {/* {this.llamada && <SText>{"COLGAR" + " " + this.llamada?.start_time+ "DDD"}</SText>} */}
        {this.llamada && <>
          <SText>{this.state.estado}</SText>
          <SText>{"COLGAR" + " "}</SText>
          {/* <SText>{this.llamada.isMuted() ? "Unmuted" : "Mute"}</SText> */}
        </>}

        {/* <SText >{this.props.phone}</SText> */}
      </SView>
    </SView>
  }
}
