 import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
  SHr, SIcon, SImage, SMath, SNavigation, SNotification,
  SPage, SPopup, SText, STheme, SView
} from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FormularioModelo from '../Components/FormularioModelo';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import PopupDetalleModelo from '../Components/PopupDetalleModelo';
import PopupDesglose from '../Components/PopupDesglose';
import PopupModeloCardex from '../Components/PopupModeloCardex';
import PopupCrearProveedor from './Components/PopupCrearProveedor';
import PopupTag from '../../tag/Components/PopupTag';
import PopupListaTag from '../../tag/Components/PopupListaTag';

export default class table extends Component {
  constructor(props) {
    super(props);
    this.state = { time: new Date().getTime() };
  }

  modelos = null;

  async loadData() {
    const modelos = await MDL.inventario.getAllModeloStock();
    this.modelos = modelos;
    return modelos;
  }

  onChangeBarcode(barcode) {
    if (this.modelos) {
      const modelo = this.modelos.find(m => m.barcode === barcode);
      if (modelo) {
        const fil = this.table.filtros.find(f => f.col === "barcode");
        this.table.filtros.splice(this.table.filtros.indexOf(fil), 1);
        this.table.filtros.push({ col: "barcode", value: modelo.barcode, operator: "=" });
        this.table.applyFilter();
        SNotification.send({
          title: modelo.descripcion,
          image: SSocket.api.inventario + "modelo/" + modelo.key + "?date=" + this.state.time,
          time: 5000,
        });
      }
    }
    console.log("Barcode read:", barcode);
  }

  getContrastColor(hex) {
    if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return "#1a1a1a";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  }

  renderColorPreview(nombre, color) {
    const displayName = nombre?.trim() || "Etiqueta";
    const backgroundColor = `${color}33`;
    return (
      <SView
        height={18}
        center
        style={{
          backgroundColor,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: color,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 6,
        }}
      >
        <SText color={this.getContrastColor(color)} fontSize={10} numberOfLines={1}>
          {displayName}
        </SText>
      </SView>
    );
  }

    onChangeBarcode(barcode) {
        if (this.modelos) {
            const modelo = this.modelos.find(m => m.barcode === barcode);
            if (modelo) {
                const fil = this.table.filtros.find(f => f.col === "barcode");
                this.table.filtros.splice(this.table.filtros.indexOf(fil), 1);
                this.table.filtros.push({
                    col: "barcode",
                    value: modelo.barcode,
                    operator: "=",

                })
                this.table.applyFilter();
                SNotification.send({
                    title: modelo.descripcion,
                    // body: `El modelo ${modelo.descripcion} ha sido encontrado.`,
                    image: SSocket.api.inventario + "modelo/" + modelo.key + "?date=" + this.state.time,
                    time: 5000,
                })
                // this.table.setSelect(modelo.key);
            }
        }
        console.log("Barcode read:", barcode);



    }


    getContrastColor(hex: string): string {
        if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return "#1a1a1a"; // Validación básica

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
    }

    renderColorPreview(nombre: string, color: string) {
        const displayName = nombre?.trim() || "Etiqueta de ejemplo";
        const backgroundColor = `${color}33`; // color con transparencia

        return (
            <SView
                height={18}
                center
                style={{
                    backgroundColor,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: color,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 6,
                }}
            >
                <SText color="white" fontSize={10} numberOfLines={1}>
                    {displayName}
                </SText>
            </SView>
        );
    }

    render() {
        return <SPage title={"Modelos"} disableScroll >
            {/* <BarcodeIcon onChange={this.onChangeBarcode.bind(this)} /> */}
            <DinamicTable
                key={"tabla_modelo"}
                ref={ref => this.table = ref}
                {...Config.table.applyTheme()}
                // colors={Config.table.colors()}
                // cellStyle={Config.table.cellStyle()}
                // textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                listFooterComponent={() => {
                    return <SHr height={100} />

                }}
                cellStyle={{
                    ...Config.table.cellStyle(),
                    padding: 2, borderWidth: 0
                }}
                loadData={this.loadData.bind(this)}
                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        height: 330,
                        label: e.row.descripcion,
                        options: [
                            // {
                            //     label: "Agregar inventario",
                            //     icon: <SIconApp name='Add' fill={STheme.color.text} />,
                            //     onPress: () => {
                            //         FormularioAgregarInventario.open({
                            //             editObject: e.row,
                            //             onSuccess: () => {
                            //                 if (this.table) {
                            //                     this.table.loadData();
                            //                     // this.state.time = new Date().getTime();
                            //                 }
                            //             }
                            //         })
                            //         // SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
                            //     }
                            // },
                            {
                                label: "Editar",
                                icon: <SIconApp name='Edit' />,
                                onPress: () => {
                                    FormularioModelo.open({
                                        editObject: e.row,
                                        onSuccess: () => {
                                            if (this.table) {
                                                this.table.loadData();
                                                // this.state.time = new Date().getTime();
                                            }
                                        }

                                    })
                                }
                            },

                            {
                                label: "Eliminar",
                                icon: <SIconApp name='Delete' />,
                                onPress: () => {
                                    SPopup.confirm({
                                        title: "Eliminar Modelo",
                                        message: "¿Está seguro de eliminar el modelo " + e.row.descripcion + "?",
                                        onPress: () => {
                                            MDL.inventario.saveModelo({
                                                key: e.row.key,
                                                estado: 0,
                                            }).then(() => {
                                                if (this.table) {
                                                    this.table.loadData();
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                label: "Agregar Proveedor",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/proveedor", {
                                        onSelect: (prov) => {

                                            MDL.inventario.saveModeloProveedor({
                                                key_modelo: e.row.key,
                                                key_proveedor: prov.key,
                                            })
                                        }
                                    });
                                }
                            },

                            {
                                label: "Agregar Tag",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/tag", {


                                        onSelect: (item) => {
                                            MDL.inventario.modelo_tag.registrar({
                                                key_modelo: e.row.key,
                                                key_tag: item.key,
                                            });

                                            if (this.table) {
                                                this.table.loadData();
                                            }
                                        }
                                    });
                                }
                            },



                            {
                                label: "Ingrediente",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/modelo/ingrediente", {
                                        key_modelo: e.row.key
                                    })
                                }
                            },
                            {
                                label: "Ver Marca",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/marca/edit", { pk: e.row.key_marca });
                                }
                            },
                            {
                                label: "Ver Tipo",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
                                }
                            },

                            {
                                label: "Ver desglose",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {

                                    PopupDesglose.open({
                                        key_modelo: e.row.key
                                    })
                                }
                            },
                            {
                                label: "Ver Cardex",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {

                                    PopupModeloCardex.open({
                                        key_modelo: e.row.key
                                    })
                                }
                            },

                        ]
                    });
                  }
                },
                {
                  label: "Eliminar",
                  icon: <SIconApp name='Delete' />,
                  onPress: () => {
                    SPopup.confirm({
                      title: "Eliminar Modelo",
                      message: "¿Está seguro de eliminar el modelo " + e.row.descripcion + "?",
                      onPress: async () => {
                        await MDL.inventario.saveModelo({ key: e.row.key, estado: 0 });
                        this.table?.loadData();
                      }
                    });
                  }
                },
                {
                  label: "Agregar Proveedor",
                  icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                  onPress: () => {
                    SNavigation.navigate("/proveedor", {
                      onSelect: (prov) => {
                        MDL.inventario.saveModeloProveedor({
                          key_modelo: e.row.key,
                          key_proveedor: prov.key,
                        });
                      }
                    });
                  }
                },
                // 🔥 NUEVA LÓGICA MEJORADA
                {
                  label: "Agregar Tag",
                  icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                  onPress: () => {
                    const existingTags = e.row?.tags?.map(t => t.tags) ?? [];
                    PopupListaTag.open({
                      selectedTags: existingTags,
                      onChange: async (newTags) => {
                        try {
                          const oldTagKeys = existingTags.map(t => t.key);
                          const newTagKeys = newTags.map(t => t.key);

                          const tagsToAdd = newTagKeys.filter(key => !oldTagKeys.includes(key));
                          const tagsToRemove = oldTagKeys.filter(key => !newTagKeys.includes(key));

                }}
            >
                <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"tipo_producto"} label='Tipo' width={90} data={(e) => e.row?.tipo_producto?.descripcion}
                    textStyle={{
                        fontSize: 10,
                        color: STheme.color.lightGray,
                    }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"marca"} label='Marca' width={90} data={(e) => e.row?.marca?.descripcion}
                    textStyle={{
                        fontSize: 10,
                        color: STheme.color.lightGray,
                    }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion}
                    wrap
                    textStyle={{ fontWeight: "bold" }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"observacion"} label='Observacion' width={150} data={(e) => e.row.observacion}

                          // Eliminar los desmarcados
                          for (let key_tag of tagsToRemove) {
                            const tagObj = e.row.tags.find(t => t.key_tag === key_tag);
                            if (tagObj) {
                              await MDL.inventario.modelo_tag.editar({
                                key: tagObj.key,
                                estado: 0,
                              });
                            }
                          }

                          await this.table.loadData();
                          this.forceUpdate();
                        } catch (error) {
                          console.error("Error actualizando etiquetas:", error);
                          SPopup.alert("Error al actualizar etiquetas.");
                        }
                      },
                    });
                  }
                },
                {
                  label: "Ver desglose",
                  icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                  onPress: () => PopupDesglose.open({ key_modelo: e.row.key })
                },
                {
                  label: "Ver Cardex",
                  icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                  onPress: () => PopupModeloCardex.open({ key_modelo: e.row.key })
                }
              ]
            });
          }}
        >
          <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
          <DinamicTable.Col key="nombre" label='Nombre' width={200} data={(e) => e.row.descripcion} />
          <DinamicTable.Col
            key="tags"
            label="Tags"
            width={180}
            data={e => (e.row?.tags ?? []).map(p => p?.tags?.nombre)}
            customComponent={e => (
              <SView row>
                {(e.row?.tags ?? []).map(item => (
                  <SView key={item.key} style={{ margin: 2 }}>
                    {this.renderColorPreview(item?.tags?.nombre, item?.tags?.color)}
                  </SView>
                ))}
              </SView>
            )}
          />
        </DinamicTable>
        <FloatButtom onPress={() => {
          PopupDetalleModelo.open({
            key_modelo: null,
            onSuccess: () => {
              this.table?.loadData();
              this.setState({ time: new Date().getTime() });
            }
          });
        }} />
      </SPage>
    );
  }
}


const ImageLabel = (props) => {
    return <SView row style={{
        alignItems: "center",
    }}>
        <SView style={{
            width: 25,
            height: 25,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: STheme.color.card,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={props.src} enablePreview
                srcPreview={props.srcPreview}
                style={{
                    resizeMode: "cover",
                }} />
        </SView>
        <SView width={8} />
        <SText flex style={props.textStyle} numberOfLines={props.colData.wrap ? 0 : 1} >{props.data}</SText>
    </SView>
}
