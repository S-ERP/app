import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, Platform, BackHandler, ScrollView } from 'react-native'
// import {  } from 'react-native-svg'
import { SDate, SHr, SNavigation, SText, SView } from 'servisofts-component'
import ReportButtom from './ReportButtom'

export default class ErrorWindow extends Component {

    closeApp() {
        Platform.select({
            android: () => {
                BackHandler.exitApp();
                // SPopup.success({ title: "Gracias por reportar", body: "En breve nos pondremos en contacto contigo" })
            },
            ios: () => {
                BackHandler.exitApp();
                // SPopup.success({ title: "Gracias por reportar", body: "En breve nos pondremos en contacto contigo" })
            },
            web: () => {
                window.location.href = "/"
            }
        }).apply()
    }
    render() {
        return (
            <ScrollView>
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: '#31C2F1',
                    borderRadius: 16,
                    margin: 16,
                    height: "100%",
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <View style={{
                        alignItems: 'center',
                    }}>
                        {/* <Icon name="rocket" size={30} color="#900" /> Ajusta el nombre del icono y sus propiedades */}
                        <Text style={{
                            fontSize: 25,
                            fontWeight: 'bold',
                            marginVertical: 8,
                            color: '#FFFFFF',
                        }}>¡ALGO MALO PASA!</Text>
                        <View style={{ height: 20 }} />
                        <SView height={276}>
                            <Image
                                source={require('../../Assets/img/bug.png')}
                                style={{ width: 230, height: 276 }}
                            />
                        </SView>
                        <View style={{ height: 20 }} />

                        <Text style={{
                            fontSize: 16,
                            color: '#FFFFFF',
                            textAlign: 'center',
                        }}>{this.props?.error?.message}</Text>
                        <SHr />
                        <Text style={{ fontSize: 12, color: '#FFFFFF' }}>src: {this.props?.route?.name}</Text>
                        <Text style={{ fontSize: 12, color: '#FFFFFF' }}>{new SDate().toString("yyyy-MM-dd hh:mm:ss")}</Text>
                        <SHr />
                        <View style={{ height: 50 }} />
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                        }} >
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    padding: 10,
                                    borderRadius: 5,
                                    alignItems: 'center',
                                    width: 100,
                                    flex: 1,
                                    height: 50,
                                    justifyContent: 'center',
                                }}
                                onPress={() => {
                                    this.closeApp();
                                }
                                }
                            >
                                <Text style={{
                                    color: '#000',
                                    fontSize: 16,
                                }}>IGNORAR</Text>
                            </TouchableOpacity>
                            <View style={{ width: 20 }} />
                            <ReportButtom {...this.props} closeApp={this.closeApp} />
                        </View>
                        <Text style={{ fontSize: 12, color: '#EEEEEE' }}>{"Reporte el error y vuelva a iniciar la app."}</Text>
                    </View>
                    {/* <Text >
                    {this.props.errorInfo.componentStack}
                </Text> */}
                </View>
            </ScrollView>
        )
    }
}