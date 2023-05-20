import { SDate, STheme } from "servisofts-component"

export default ({ qr_src, caja, cajero, sucursal, pv }) => {
    return {
        "type": "div",
        "style": {
            "width": "100%"
        },
        "childrens": [
            {
                "type": "div",
                "style": {
                    "width": "100%",
                    "flexDirection": "row",
                    "height": 90
                },
                "childrens": [
                    {
                        "type": "div",
                        "style": {
                            "flex": 1
                        },
                        "childrens": [
                            {
                                "type": "text",
                                "childrens": "Caja",
                                "style": {
                                    "fontSize": 20
                                }
                            },
                            {
                                "type": "div",
                                "style": {
                                    "width": "100%",
                                    "height": 8
                                }
                            },
                            {
                                "type": "div",
                                "style": {
                                    "width": "100%"
                                },
                                "childrens": [
                                    {
                                        "type": "text",
                                        "childrens": new SDate(caja.fecha_on).toString("yyyy, MONTH dd, hh:mm"),
                                        "style": {
                                            "fontSize": 12
                                        }
                                    },
                                    {
                                        "type": "text",
                                        "childrens": !caja.fecha_cierre ? "Caja abierta" : new SDate(caja.fecha_cierre).toString("yyyy, MONTH dd, hh:mm"),
                                        "style": {
                                            "fontSize": 12,
                                            "color": !!caja.fecha_cierre ? "#A21717" : STheme.color.warning
                                        }
                                    },
                                    {
                                        "type": "div",
                                        "style": {
                                            "width": "100%",
                                            "height": 4
                                        }
                                    },
                                    {
                                        "type": "text",
                                        "childrens": "Sucursal / Cajero",
                                        "style": {
                                            "fontSize": 10,
                                            "color": "#666666"
                                        }
                                    },
                                    {
                                        "type": "div",
                                        "style": {
                                            "height": 4
                                        }
                                    },
                                    {
                                        "type": "text",
                                        "childrens": sucursal.descripcion + " - " + pv.descripcion,
                                        "style": {
                                            "fontSize": 12
                                        }
                                    },
                                    {
                                        "type": "text",
                                        "childrens": cajero["Nombres"] + " " + cajero["Apellidos"],
                                        "style": {
                                            "fontSize": 12,
                                            "color": "#666666"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "div",
                        "style": {
                            "width": 90,
                            "height": 90
                        },
                        "childrens": [
                            {
                                "type": "image",
                                "style": {
                                    "width": 90,
                                    "height": 90
                                },
                                "src": qr_src
                            }
                        ]
                    }
                ]
            },
            {
                "type": "div",
                "style": {
                    "height": 8
                }
            },
            {
                "type": "div",
                "style": {
                    "width": "100%",
                    "alignItems": "center",
                    "paddingBottom": 4
                },
                "childrens": [
                    {
                        "type": "text",
                        "childrens": "Detalle",
                        "style": {
                            "fontSize": 14
                        }
                    }
                ]
            },
            {
                "type": "div",
                "style": {
                    "width": "100%",
                    "height": 1,
                    "backgroundColor": "#666666"
                }
            }
        ]
    }
}