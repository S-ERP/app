import { SInputsCofig, STheme } from 'servisofts-component';
const inputs = (): SInputsCofig => {
    return {
        default: {
            LabelStyle: {
                position: "absolute",
                top: -8,
                left: 0,
                fontSize: 12,
                width: "100%",
                // color: STheme.color.text,
                // backgroundColor:STheme.color.primary+"22",
                // borderRadius:4,
                // padding:4,
                // backgroundColor: "#E0E0E0" + "55",
            },
            View: {
                // borderWidth: 2,
                //  borderColor: "#E0E0E0" + "40",
                height: 40,
                borderRadius: 2,
                marginTop: 30,
                paddingStart: 4,
                backgroundColor: STheme.color.card,
                // backgroundColor: '#E0E0E0' + '35'
            },
            InputText: {
                // fontSize: 16,

                paddingLeft: 8,
                paddingRight: 8,
                color: STheme.color.text,
                placeholderTextColor: STheme.color.gray
                // backgroundColor: "#E0E0E0" + "55",
                // height: 55,
                // borderRadius: 16,
                // backgroundColor: STheme.color.card,
            },
            error: {
                // borderRadius: 16,
                borderWidth: 1,
                borderColor: "#FA8081"
            },


        },
        tipoPago: {
            LabelStyle: {
                position: "absolute",
                top: -8,
                left: 0,
                fontSize: 12,
                width: "100%",
            },
            View: {
                height: 40,
                borderRadius: 2,
                marginTop: 30,
                paddingStart: 4,
                backgroundColor: STheme.color.card,
                borderWidth: 2,
                borderColor: STheme.color.lightGray + "55",
            },
            InputText: {
                paddingLeft: 8,
                paddingRight: 8,
                color: STheme.color.text,
                placeholderTextColor: STheme.color.gray
            },
            error: {
                borderWidth: 2,
                borderColor: "#FA8081"
            },
        },
        erp: {
            labelProps: {
                clean: true
            },
            LabelStyle: {
                position: "absolute",
                // width: "100%",
                top: -6,
                left: 4,
                fontSize: 10,
                color: STheme.color.lightGray,
                // fontWeight: "bold",
                borderRadius: 4,
                paddingHorizontal: 4,
                // borderRadius:4,
                // color: STheme.color.text,
                backgroundColor: STheme.color.background+"AA",
                // borderRadius:4,
                // padding:4,
                // backgroundColor: "#E0E0E0" + "55",
            },
            View: {
                // borderWidth: 2,
                //  borderColor: "#E0E0E0" + "40",
                height: 36,
                // justifyContent: 'center',
                // flexDirection: 'row',
                borderRadius: 2,
                // marginTop: 30,
                // paddingStart: 4,
                backgroundColor: STheme.color.card,
                // backgroundColor: '#E0E0E0' + '35'
            },
            InputText: {
                fontSize: 12,

                paddingLeft: 8,
                paddingRight: 8,
                color: STheme.color.text,
                placeholderTextColor: STheme.color.gray
                // backgroundColor: "#E0E0E0" + "55",
                // height: 55,
                // borderRadius: 16,
                // backgroundColor: STheme.color.card,
            },
            error: {
                // borderRadius: 16,
                borderWidth: 1,
                borderColor: "#FA8081"
            },


        },
        factura: {
            LabelStyle: {
                position: "absolute",
                top: -5,
                left: 0,
                fontSize: 10,
                // fontWeight: "bold",
                width: "100%",
                color: STheme.color.text + "66",
                // backgroundColor:STheme.color.primary+"22",
                // borderRadius:4,
                // padding:4,
                // backgroundColor: "#E0E0E0" + "55",
            },
            View: {
                // borderWidth: 2,
                //  borderColor: "#E0E0E0" + "40",
                // flex:0,
                // width:"auto",
                height: 24,
                borderRadius: 4,
                marginTop: 18,
                paddingStart: 0,
                justifyContent: 'center',
                // borderWidth: 1,
                borderLeftWidth: 1,
                borderBottomWidth: 1,
                borderColor: "#66666644",
                backgroundColor: STheme.color.text + "11",
                // backgroundColor: '#E0E0E0' + '35'
            },
            InputText: {
                // fontSize: 16,
                paddingLeft: 4,
                paddingRight: 4,
                fontSize: 12,
                color: STheme.color.text,
                placeholderTextColor: STheme.color.gray,
                fontFamily: "Roboto",

                // backgroundColor: "#E0E0E0" + "55",
                // height: 55,
                // borderRadius: 16,
                // backgroundColor: STheme.color.card,
            },
            error: {
                // borderRadius: 16,
                borderWidth: 1,
                borderColor: "#FA8081"
            },


        },
        facturaDuplicar: {
            LabelStyle: {
                position: "absolute",
                top: -5,
                left: 0,
                fontSize: 10,
                width: "100%",
                color: STheme.color.text + "66",
            },
            View: {
                height: 24,
                borderRadius: 4,
                marginTop: 18,
                paddingStart: 0,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: STheme.color.card,
                // borderColor: "#2563eb",
                backgroundColor: STheme.color.text + "11",
            },
            InputText: {
                paddingLeft: 4,
                paddingRight: 4,
                fontSize: 12,
                color: STheme.color.text,
                placeholderTextColor: STheme.color.gray,
                fontFamily: "Roboto",
            },
            error: {
                borderWidth: 1,
                borderColor: "#FA8081"
            },
        }
    }
}
export default inputs;
