import React, { Component } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { AccentBar, TopBar } from '../../Components';
import { SImage, SText, STheme, SView } from 'servisofts-component';
import Reanimated, { } from "react-native-reanimated"
const { Value } = Reanimated;
export default class root extends Component {

    static TOPBAR = <>
        <TopBar type={"default"} />
    </>
    static FOOTER = <>
        <AccentBar type='2' />
    </>

    animatedScroll = new Value(0);

    constructor(props) {
        super(props);
        this.state = {
        };
    }
    handleScroll = (e) => {
        const { contentOffset } = e.nativeEvent;
        console.log(contentOffset.y)
        this.animatedScroll.setValue(contentOffset.y)
        // console.log(e);
    }

    render() {
        return <View style={{ width: "100%", backgroundColor: "#00000066", flex: 1 }}>
            <ScrollView
                style={{
                    width: "100%"
                }}

                bounces={false}
                onScroll={this.handleScroll.bind(this)}
                overScrollMode="never"
                stickyHeaderIndices={[1]}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    width: "100%",
                }}
            >
                <SView width={"100%"} center height={150} >

                </SView>
                <SView width={"100%"} center height={150} backgroundColor={STheme.color.card}>
                    <SView style={{
                        width: "100%",
                        height: 300,
                        bottom: 0,
                        position: "absolute",

                    }}>
                        <SImage src={require("../../Assets/img/banner_solo_tapeke.png")} style={{
                            resizeMode: "cover"
                        }} />
                        <SView animated style={{
                            position: 'absolute',
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#000000",
                            opacity: this.animatedScroll.interpolate({
                                inputRange: [0, 100, Infinity],
                                outputRange: [0, 0.5, 0.5]
                            })
                        }}>

                        </SView>
                    </SView>
                    <SView col={"xs-12"} row center>
                        <SView width={50} height={50} style={{
                            borderRadius: 100,
                            backgroundColor: STheme.color.card
                        }}></SView>
                        <SText animated style={{

                            transform: [{
                                translateY: this.animatedScroll.interpolate({
                                    inputRange: [0, 150, Infinity],
                                    outputRange: [50, 0, 0]
                                }),
                            }, {
                                translateX: this.animatedScroll.interpolate({
                                    inputRange: [0, 150, Infinity],
                                    outputRange: [-50, 0, 0]
                                })
                            }]
                        }}>NOMBRE DEL RESTAURANTE</SText>
                    </SView>
                </SView>
                <SView width={"100%"} center height={350} border={"#000"}>

                </SView>
                <SView width={"100%"} center height={350} border={"#000"}>

                </SView>
                <Animated.View style={{
                    width: "100%",
                    backgroundColor: "#f0f",
                    height: 50,
                    zIndex: 999,
                    transform: [{
                        translateY: this.animatedScroll.interpolate({
                            inputRange: [0, 850, 950],
                            outputRange: [0, 0, 100]
                        })
                    }]
                }} />

                <SView width={"100%"} center height={350} border={"#000"}>

                </SView>
                <SView width={"100%"} center height={350} border={"#000"}>

                </SView>
            </ScrollView>
        </View>
    }
}
