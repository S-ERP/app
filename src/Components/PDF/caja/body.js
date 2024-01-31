import { SDate, SMath } from "servisofts-component"

const builItem = (obj) => {
    return {
        "type": "div",
        "style": {
            "width": "100%",
            "paddingTop": 8,
            "paddingBottom": 8
        },
        "childrens": [
            {
                "type": "div",
                "style": {
                    "width": "100%",
                    "flexDirection": "row",
                    "height": 14
                },
                "childrens": [
                    {
                        "type": "div",
                        "style": {
                            "flex": 4
                        },
                        "childrens": [
                            {
                                "type": "text",
                                "childrens": new SDate(obj.fecha_on).toString("hh:mm"),
                                "style": {
                                    "color": "#666666"
                                }
                            }
                        ]
                    },
                    {
                        "type": "div",
                        "style": {
                            "flex": 1
                        },
                        "childrens": [
                            {
                                "type": "text",
                                "childrens": obj.key_tipo_pago
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
                                "childrens": SMath.formatMoney(obj.monto)
                            }
                        ]
                    }
                ]
            },
            {
                "type": "text",
                "childrens": obj.descripcion,
                "style": {
                    "color": "#000000"
                }
            },
            // {
            //     "type": "text",
            //     "childrens": "PERICO DE LOS PALOTES",
            //     "style": {
            //         "fontSize": 10,
            //         "color": "#666666"
            //     }
            // }
        ]
    }
}

export default ({ caja_detalles }) => {
    return Object.values(caja_detalles).sort((a, b) => {
        return new SDate(b.fecha_on).getTime() - new SDate(a.fecha_on).getTime()
    }).map((o) => {
        return builItem(o)
    })
}