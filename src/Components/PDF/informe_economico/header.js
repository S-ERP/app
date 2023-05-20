import { SDate, STheme } from "servisofts-component"

export default ({ }) => {
    return {
        "type": "div",
        "style": {
            "width": "100%"
        },
        "childrens": [
            {
                "type": "text",
                "childrens": "CONDOMINIO SANTA MARIA",
                "style": {
                    "width": 90,
                    "fontSize": 12,
                    "font": "Times New Roman"
                }
            },
            {
                "type": "div",
                "style": {
                    "width": "100%",
                    "alignItems": "center"
                },
                "childrens": [
                    {
                        "type": "text",
                        "childrens": "INFORME ECONOMICO",
                        "style": {
                            "fontSize": 16,
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
                    {
                        "type": "text",
                        "childrens": "Desde el 1 de abril del 2023, hasta el 30 de abril de 2023.",
                        "style": {
                            "fontSize": 12,
                            "font": "Times New Roman"
                        }
                    }
                ]
            }
        ]
    }
}