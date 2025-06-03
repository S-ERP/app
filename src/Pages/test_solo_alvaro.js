import React, { Component } from "react";
import { Animated } from "react-native";
import {
 SPage,
 SView,
 SText,
 SIcon,
 SHr,
 STheme,
} from "servisofts-component";

export default class Test extends Component {
 constructor(props) {
  super(props);
  this.state = {
   scale: new Animated.Value(1),
  };
 }

 componentDidMount() {
  this.startPulse();
 }

 startPulse = () => {
  Animated.loop(
   Animated.sequence([
    Animated.timing(this.state.scale, {
     toValue: 1.2,
     duration: 500,
     useNativeDriver: true,
    }),
    Animated.timing(this.state.scale, {
     toValue: 1,
     duration: 500,
     useNativeDriver: true,
    }),
   ])
  ).start();
 };

 render() {
  const animatedStyle = {
   transform: [{ scale: this.state.scale }],
  };

  return (
   <SPage disableScroll hidden>
    <SView col="xs-12" row center>
     <SView col="xs-3.5" row center>
      <SView
       width={180}
       center
       style={{
        borderColor: "white",
        borderRadius: 48,
        borderWidth: 6,
        backgroundColor: "#8CB1F8",
       }}
      >
       <SView col="xs-12" row center>
        {/* Círculo animado */}
        <SView col="xs-3" row center>
         <Animated.View
          style={[
           animatedStyle,
           {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.3)",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
           },
          ]}
         >
          <SView
           style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 0 8px #fff",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
           }}
          />
         </Animated.View>
        </SView>

        {/* Texto de llamada */}
        <SView col="xs-6" row center>
         <SView col="xs-9" row>
          <SText color="#1D252D">Llamando.</SText>
          <SText color="#1D252D" bold>
           00:00:00
          </SText>
         </SView>
        </SView>

        {/* Icono de micrófono */}
        <SView col="xs-3" row center>
         <SView
          width={28}
          height={28}
          row
          center
          style={{ borderRadius: 8, backgroundColor: "#FFFFFF" }}
         >
          <SIcon name="microfono" fill="#1D252D" height={18} />
         </SView>
        </SView>
       </SView>
      </SView>
     </SView>
    </SView>
    <SHr height={10} />
   </SPage>
  );
 }
}
