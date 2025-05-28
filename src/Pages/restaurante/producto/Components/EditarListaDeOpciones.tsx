import React, {
    Component,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import {
    SDate,
    SHr,
    SIcon,
    SImage,
    SInput,
    SNavigation,
    SPage,
    SPopup,
    SText,
    STheme,
    SThread,
    SView,
} from 'servisofts-component';
import {ProductoType, SubProductoDetalleType, SubProductoType} from '../types';
import {
    Dimensions,
    SectionList,
    SectionListRenderItem,
    StyleSheet,
    Vibration,
    View,
} from 'react-native';
import SelectHabilitado from './SelectHabilitado';
import BtnNaranja from './BtnNaranja';
import SSocket from 'servisofts-socket';
import Model from '../../../../Model';
import FormularioOpciones from './FormularioOpciones';
import FormularioSubProductos from './FormularioSubProductos';

type ListaDeOpcionesProps = {
    producto: ProductoType;
};

const tiempoHabilitacion = (item: any) => {
    let label = 'No disponible';
    if (item.estado == 1) {
        label = 'Disponible';
    }
    const ahora = new SDate();
    const fechaObjetivo = new SDate(
        item.fecha_habilitacion_automatica,
        'yyyy-MM-ddThh:mm:ss'
    );

    const diferencia = fechaObjetivo.getTime() - ahora.getTime();
    if (diferencia < 0) {
        return 'La fecha y hora ya han pasado';
    }

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    // const dias = Math.floor(horas / 24);

    if (!horas && !minutos && !segundos) {
        return `${label}`;
    }
    if (minutos <= 0) {
        return `${label}\npor ${segundos % 60} segundos`;
    }
    if (horas <= 0) {
        return `${label}\npor ${minutos % 60} minutos`;
    }

    return `${label}\npor ${horas % 24} horas`;
};

const buildData = (sub_productos: SubProductoType[]) => {
    return sub_productos.map(a => {
        return {
            ...a,
            data: a.sub_producto_detalles,
        };
    });
};

const renderEmptySection = () => <View style={styles.emptySection} />;

const hanlePress = (item: any, onChange: any, e: any) => {
    Vibration.vibrate(100);
    e.currentTarget.measure(
        (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
            const key_popup = 'popupkey';
            const windowheight = Dimensions.get('window').height;
            const itemWidth = 200;
            const itemHeight = 176;
            let top = pageY + 40;
            if (itemHeight + top > windowheight) {
                top = windowheight - itemHeight;
            }
            SPopup.open({
                key: key_popup,
                type: '2',
                content: (
                    <SelectHabilitado
                        style={{
                            left: pageX - itemWidth + width + 8,
                            top: top,
                            itemWidth: itemWidth,
                            itemHeight: itemHeight,
                        }}
                        onSelect={(select: any) => {
                            let tipo = false;
                            console.log(select.key);
                            let fecha_habilitacion_automatica: any = 'null';
                            if (select.key != 'true' && select.key != 'false') {
                                console.log('entro aca');
                                let num = select.key;
                                if (select.key < 0) {
                                    tipo = true;
                                    num = num * -1;
                                } else {
                                    tipo = false;
                                }
                                fecha_habilitacion_automatica = new SDate()
                                    .addMinute(parseInt(num))
                                    .toString('yyyy-MM-ddThh:mm:ss');
                            } else {
                                tipo = select.key == 'true';
                                console.log('entro aca', tipo);
                            }
                            SSocket.sendPromise({
                                component: 'sub_producto_detalle',
                                type: 'editar',
                                key_usuario: Model.usuario.Action.getKey(),
                                data: {
                                    key: item.key,
                                    estado: !!tipo ? 1 : -1,
                                    accion_habilitacion_automatica: tipo
                                        ? '-1'
                                        : '1',
                                    fecha_habilitacion_automatica:
                                        fecha_habilitacion_automatica,
                                },
                            })
                                .then((f: any) => {
                                    item.estado = f.data.estado;
                                    item.fecha_habilitacion_automatica =
                                        f.data.fecha_habilitacion_automatica;
                                    if (onChange) onChange(item);
                                    // Model.restaurante.Action._dispatch({
                                    //     ...f,
                                    //     data: this.data
                                    // });
                                    // this.setState({ ...this.state })
                                    console.log(f);
                                })
                                .catch(e => {
                                    console.error(e);
                                });
                            SPopup.close(key_popup);
                        }}
                    />
                ),
            });
        }
    );
};

const Tachar = ({estado}: {estado: number}) => {
    return estado != 0 ? null : (
        <>
            <SView
                style={{
                    position: 'absolute',
                    width: '100%',
                    transform: [{rotate: '-5deg'}],
                    height: 1,
                    backgroundColor: STheme.color.danger,
                }}
            />
            <SView
                style={{
                    position: 'absolute',
                    width: '100%',
                    transform: [{rotate: '5deg'}],
                    height: 1,
                    backgroundColor: STheme.color.danger,
                }}
            />
        </>
    );
};
const BtnEditar = ({
    size,
    src,
    onPress,
}: {
    size: number;
    src?: any;
    onPress?: any;
}) => {
    return (
        <SView
            width={size}
            height={size}
            style={{
                borderRadius: 4,
                borderWidth: 0.5,
                borderColor: STheme.color.lightGray,
                padding: 2,
            }}
            onPress={onPress}
        >
            <SImage
                src={src ?? require('../../../../Assets/img/EDITAR2.png')}
            />
        </SView>
    );
};

const ListaDeOpciones = ({producto}: ListaDeOpcionesProps) => {
    const [openSections, setOpenSections] = useState<any>({});
    const {sub_productos} = producto;
    const data = buildData(sub_productos);
    const spaceEnd = 50;
    const RenderItem = ({}: any) => {};
    const renderSectionHeader = ({section}: any) => {};

    // @ts-ignore
    const objEmpty: SubProductoType = {key: 'void'};
    // @ts-ignore
    const objEmptyClose: SubProductoType = {key: 'close'};
    const sections: any = data
        .map(sec => ({
            ...sec,
            data: openSections[sec.key]
                ? sec.data.length <= 0
                    ? [objEmpty]
                    : sec.data.sort((a, b) => a.index - b.index)
                : [objEmptyClose],
            cantidad: sec.data.length,
        }))
        .sort((a, b) => a.index - b.index);
    return (
        <SView col={'xs-12'}>
            <SectionList
                sections={sections}
                renderSectionHeader={({section}: any) => (
                    <SView col={'xs-12'} row center>
                        <SView
                            style={[
                                styles.header,
                                openSections[section.key]
                                    ? {
                                          borderBottomLeftRadius: 0,
                                          borderBottomRightRadius: 0,
                                      }
                                    : {},
                            ]}
                            onPress={() => {
                                Vibration.vibrate(300);
                                if (!openSections[section.key]) {
                                    openSections[section.key] = section;
                                } else {
                                    delete openSections[section.key];
                                }
                                setOpenSections({...openSections});
                            }}
                            row
                            center
                        >
                            <SView flex>
                                <SText fontSize={14} font='Montserrat-SemiBold'>
                                    {section.nombre}
                                </SText>
                                <SText color={STheme.color.gray} fontSize={12}>
                                    {section.cantidad > 0
                                        ? section.cantidad + ' Subproductos'
                                        : 'Sin Subproductos'}
                                </SText>
                            </SView>
                            <SView height center>
                                <SView
                                    width={16}
                                    height={16}
                                    style={{
                                        transform: [
                                            {
                                                rotate: openSections[
                                                    section.key
                                                ]
                                                    ? '90deg'
                                                    : '270deg',
                                            },
                                        ],
                                    }}
                                >
                                    <SIcon
                                        name='Back'
                                        fill={STheme.color.lightGray}
                                    />
                                </SView>
                            </SView>
                            <Tachar estado={section.estado} />
                        </SView>
                        <SView width={spaceEnd} row>
                            <SView flex />
                            <BtnEditar
                                size={22}
                                onPress={() => {
                                    FormularioOpciones.openPopup({
                                        data: section,
                                        onChange: subproductoedit => {
                                            const existe =
                                                producto.sub_productos.findIndex(
                                                    a =>
                                                        a.key ==
                                                        subproductoedit.key
                                                );
                                            if (existe > -1) {
                                                producto.sub_productos[
                                                    existe
                                                ].index = subproductoedit.index;
                                                producto.sub_productos[
                                                    existe
                                                ].nombre =
                                                    subproductoedit.nombre;
                                                producto.sub_productos[
                                                    existe
                                                ].descripcion =
                                                    subproductoedit.descripcion;
                                                producto.sub_productos[
                                                    existe
                                                ].cantidad_seleccion =
                                                    subproductoedit.cantidad_seleccion;
                                                producto.sub_productos[
                                                    existe
                                                ].cantidad_seleccion_minima =
                                                    subproductoedit.cantidad_seleccion_minima;
                                                console.log('Existe', existe);
                                            } else {
                                                // producto.sub_productos.push(subproductoedit)
                                                console.log(
                                                    'No Existe',
                                                    existe
                                                );
                                            }
                                            setOpenSections({...openSections});
                                        },
                                    });
                                }}
                            />
                            <SView flex />
                            <BtnEditar
                                src={
                                    section.estado != 0
                                        ? require('../../../../Assets/img/borrar.png')
                                        : require('../../../../Assets/img/reload.png')
                                }
                                size={22}
                                onPress={() => {
                                    const indexSubProducto =
                                        producto.sub_productos.findIndex(
                                            a => a.key == section.key
                                        );
                                    if (indexSubProducto > -1) {
                                        const subproductoDetalletoEdit =
                                            producto.sub_productos[
                                                indexSubProducto
                                            ];
                                        if (
                                            subproductoDetalletoEdit.estado != 0
                                        ) {
                                            subproductoDetalletoEdit.estado_old =
                                                subproductoDetalletoEdit.estado;
                                            subproductoDetalletoEdit.estado = 0;
                                        } else {
                                            subproductoDetalletoEdit.estado =
                                                subproductoDetalletoEdit.estado_old ??
                                                1;
                                        }
                                        // console.log("Existe", existe)
                                    }
                                    // // this.setState({ ...this.state })
                                    // section.index = subproductoedit.index
                                    // section.nombre = subproductoedit.nombre
                                    // section.descripcion = subproductoedit.descripcion
                                    // section.cantidad_seleccion = subproductoedit.cantidad_seleccion
                                    // section.cantidad_seleccion_minima = subproductoedit.cantidad_seleccion_minima
                                    setOpenSections({...openSections});
                                }}
                            />
                        </SView>
                    </SView>
                )}
                // @ts-ignore
                renderItem={({item, section}) =>
                    item?.key == 'void' || item?.key == 'close' ? (
                        renderEmptySection()
                    ) : (
                        <SView col={'xs-12'} row>
                            <SView style={[styles.item]} row center>
                                {/* <SView width={18} padding={2} height center>
                        <SImage src={require("../../../../Assets/img/CATEGORIA.png")} />
                    </SView> */}
                                <SView width={6} />
                                <SView flex>
                                    <SText
                                        fontSize={12}
                                        font='Montserrat-SemiBold'
                                    >
                                        {item.nombre}
                                    </SText>
                                    <SText
                                        fontSize={10}
                                        color={STheme.color.gray}
                                        font='Montserrat'
                                    >
                                        {item.descripcion ?? 'Sin descripcion'}
                                    </SText>
                                </SView>
                                <SView
                                    height
                                    style={{justifyContent: 'center'}}
                                    onPress={hanlePress.bind(
                                        this,
                                        item,
                                        (elm: any) => {
                                            setOpenSections({...openSections});
                                        }
                                    )}
                                >
                                    <SView
                                        col={'xs-12'}
                                        row
                                        style={{
                                            alignItems: 'center',
                                        }}
                                    >
                                        <SView
                                            height={8}
                                            width={8}
                                            style={{
                                                borderRadius: 100,
                                                backgroundColor: !(
                                                    item.estado == 1
                                                )
                                                    ? STheme.color.danger
                                                    : STheme.color.success,
                                            }}
                                        ></SView>
                                        <SView width={4} />
                                        <SText color={'#666'} fontSize={10}>
                                            {tiempoHabilitacion(item)}
                                        </SText>
                                    </SView>
                                    {/* <SText color={"#666"} fontSize={8}>{ }</SText> */}
                                </SView>
                                <Tachar estado={item.estado} />
                            </SView>
                            <SView
                                width={spaceEnd}
                                height
                                center
                                row
                                style={{}}
                            >
                                <SView flex />
                                <BtnEditar
                                    size={22}
                                    onPress={() => {
                                        FormularioSubProductos.openPopup({
                                            data: item,
                                            onChange: subproductoedit => {
                                                const indexSubProducto =
                                                    producto.sub_productos.findIndex(
                                                        a =>
                                                            a.key == section.key
                                                    );
                                                if (indexSubProducto > -1) {
                                                    const indexSubProductoDetalle =
                                                        producto.sub_productos[
                                                            indexSubProducto
                                                        ].sub_producto_detalles.findIndex(
                                                            a =>
                                                                a.key ==
                                                                item.key
                                                        );
                                                    const subproductoDetalletoEdit =
                                                        producto.sub_productos[
                                                            indexSubProducto
                                                        ].sub_producto_detalles[
                                                            indexSubProductoDetalle
                                                        ];
                                                    subproductoDetalletoEdit.index =
                                                        subproductoedit.index;
                                                    subproductoDetalletoEdit.nombre =
                                                        subproductoedit.nombre;
                                                    subproductoDetalletoEdit.descripcion =
                                                        subproductoedit.descripcion;
                                                    subproductoDetalletoEdit.precio =
                                                        subproductoedit.precio;
                                                    // console.log("Existe", existe)
                                                }
                                                // // this.setState({ ...this.state })
                                                // section.index = subproductoedit.index
                                                // section.nombre = subproductoedit.nombre
                                                // section.descripcion = subproductoedit.descripcion
                                                // section.cantidad_seleccion = subproductoedit.cantidad_seleccion
                                                // section.cantidad_seleccion_minima = subproductoedit.cantidad_seleccion_minima
                                                setOpenSections({
                                                    ...openSections,
                                                });
                                            },
                                        });
                                    }}
                                />
                                <SView flex />
                                <BtnEditar
                                    src={
                                        item.estado != 0
                                            ? require('../../../../Assets/img/borrar.png')
                                            : require('../../../../Assets/img/reload.png')
                                    }
                                    size={22}
                                    onPress={() => {
                                        const indexSubProducto =
                                            producto.sub_productos.findIndex(
                                                a => a.key == section.key
                                            );
                                        if (indexSubProducto > -1) {
                                            const indexSubProductoDetalle =
                                                producto.sub_productos[
                                                    indexSubProducto
                                                ].sub_producto_detalles.findIndex(
                                                    a => a.key == item.key
                                                );
                                            const subproductoDetalletoEdit =
                                                producto.sub_productos[
                                                    indexSubProducto
                                                ].sub_producto_detalles[
                                                    indexSubProductoDetalle
                                                ];
                                            if (
                                                subproductoDetalletoEdit.estado !=
                                                0
                                            ) {
                                                subproductoDetalletoEdit.estado_old =
                                                    subproductoDetalletoEdit.estado;
                                                subproductoDetalletoEdit.estado = 0;
                                            } else {
                                                subproductoDetalletoEdit.estado =
                                                    subproductoDetalletoEdit.estado_old ??
                                                    1;
                                            }

                                            setOpenSections({...openSections});
                                        }
                                    }}
                                />
                            </SView>
                        </SView>
                    )
                }
                SectionSeparatorComponent={d => {
                    if (d.leadingItem && d.leadingItem?.key != 'close') {
                        return (
                            <SView col={'xs-12'} center>
                                <View style={styles.sectionSeparator} />
                                <BtnNaranja
                                    onPress={() => {
                                        FormularioSubProductos.openPopup({
                                            data: {
                                                key_sub_producto:
                                                    d?.section?.key,
                                            },
                                            onChange: subproductoedit => {
                                                const indexSubProducto =
                                                    producto.sub_productos.findIndex(
                                                        a =>
                                                            a.key ==
                                                            d.section.key
                                                    );

                                                const arrDetalles =
                                                    producto.sub_productos[
                                                        indexSubProducto
                                                    ].sub_producto_detalles;
                                                arrDetalles.push(
                                                    subproductoedit
                                                );

                                                setOpenSections({
                                                    ...openSections,
                                                });
                                            },
                                        });
                                    }}
                                >
                                    {'+ Agregar Subproductos'}
                                </BtnNaranja>
                                <View style={styles.sectionSeparator} />
                                <View style={styles.sectionSeparator} />
                                <View style={styles.sectionSeparator} />
                            </SView>
                        );
                    } else if (!d.trailingItem) {
                        return <View style={styles.sectionSeparator} />;
                    }
                    return null;
                }}
            />

            <SHr />
            <SView col={'xs-12'} center>
                {/* <BtnNaranja>{"+ Crear Opciones"}</BtnNaranja> */}
                {/* <SHr /> */}
                {/* <BtnNaranja>{"+ Agregar Subproductos"}</BtnNaranja> */}
            </SView>
        </SView>
    );
};
export default ListaDeOpciones;

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
    },
    item: {
        flex: 1,
        padding: 8,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#CCC',
    },
    header: {
        flex: 1,
        padding: 8,
        paddingTop: 16,
        paddingBottom: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderWidth: 1,
        borderColor: '#DDD',
        // backgroundColor: '#f4f4f4',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionSeparator: {
        height: 12,
        width: '100%',
    },
    emptySection: {
        height: 0,
    },
});
