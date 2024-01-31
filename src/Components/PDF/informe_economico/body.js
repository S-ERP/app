import { SDate, SMath } from "servisofts-component"


const IngresosItem = (cuenta) => {
    return {
        "type": "div",
        "style": {
            "width": "100%",
            "flexDirection": "row",
            "height": 16
        },
        "childrens": [
            {
                "type": "div",
                "style": {
                    "flex": 3
                },
                "childrens": [
                    {
                        "type": "text",
                        "childrens": cuenta.descripcion,
                        "style": {
                            "fontSize": 12,
                            "font": "Times New Roman"
                        }
                    }
                ]
            },
            {
                "type": "div",
                "style": {
                    "flex": 1,
                    "alignItems": "end"
                },
                "childrens": [
                    {
                        "type": "text",
                        "childrens": SMath.formatMoney(cuenta.monto),
                        "style": {
                            "fontSize": 12,
                            "font": "Times New Roman",
                            "fontWeight": "bold"
                        }
                    }
                ]
            }
        ]
    }
}

const totales = ({ codigo_cuenta, label, props }) => {
    let total = 0;
    let ingresos = [];
    Object.values(props.data).map((o) => {
        let cuenta = props.cuentas.find(a => a.key == o.key_cuenta_contable);
        if (cuenta && cuenta.codigo) {
            for (let i = 0; i < codigo_cuenta.length; i++) {
                const element_cc = codigo_cuenta[i];
                if (cuenta.codigo.startsWith(element_cc)) {
                    total += o.monto;
                    cuenta.monto = o.monto;
                    ingresos.push(cuenta)
                }

            }

        }


    })
    return [
        {
            "type": "text",
            "childrens": (label + "").toUpperCase(),
            "style": {
                "fontSize": 12,
                "font": "Times New Roman",
                "fontWeight": "bold"
            }
        },
        {
            "type": "div",
            "style": {
                "width": "100%",
                "height": 4
            }
        },
        ...Object.values(ingresos).map(o => IngresosItem(o)),
        {
            "type": "div",
            "style": {
                "width": "100%",
                "flexDirection": "row",
                "height": 2
            },
            "childrens": [
                {
                    "type": "div",
                    "style": {
                        "flex": 3
                    },
                    "childrens": []
                },
                {
                    "type": "div",
                    "style": {
                        "flex": 1,
                        "height": 2,
                        "backgroundColor": "#000000"
                    },
                    "childrens": []
                }
            ]
        },
        {
            "type": "div",
            "style": {
                "width": "100%",
                "flexDirection": "row",
                "height": 16
            },
            "childrens": [
                {
                    "type": "div",
                    "style": {
                        "flex": 3,
                        "alignItems": "center",
                        "height": 16
                    },
                    "childrens": [
                        {
                            "type": "text",
                            "childrens": "Total " + (label + "").toLowerCase(),
                            "style": {
                                "fontSize": 12,
                                "fontWeight": "bold",
                                "font": "Times New Roman"
                            }
                        }
                    ]
                },
                {
                    "type": "div",
                    "style": {
                        "flex": 1,
                        "alignItems": "end",
                        "height": 16
                    },
                    "childrens": [
                        {
                            "type": "text",
                            "childrens": SMath.formatMoney(total),
                            "style": {
                                "fontSize": 12,
                                "fontWeight": "bold",
                                "font": "Times New Roman"
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
export default (props) => {
    return [
        ...totales({ codigo_cuenta: ["4"], label: "ingresos", props }),
        {
            "type": "div",
            "style": {
                "width": "100%",
                "height": 50
            },
            "childrens": []
        },
        ...totales({ codigo_cuenta: ["5", "6"], label: "egresos", props }),
        // ...totales({ codigo_cuenta: "6", label: "egresos", props }),
    ]

}