import { TextStyle, ViewStyle } from "react-native";
import { STheme } from "servisofts-component"

export default {
    applyTheme(p?: { colors?: any, cellStyle?: ViewStyle, textStyle?: TextStyle, headerStyle?: ViewStyle }) {
        return {
            colors: this.colors(p?.colors ?? {}),
            cellStyle: this.cellStyle(p?.cellStyle ?? {}),
            textStyle: this.textStyle(p?.textStyle ?? {}),
            headerStyle: this.headerStyle(p?.headerStyle ?? {}),
            headerTextStyle: this.headerTextStyle(p?.headerStyle ?? {}),
        }
    },
    colors: (override?: any) => {
        const card = STheme.getTheme() == "dark" ? "#FFFFFF66" : "#00000066";
        return {
            text: STheme.color.text,
            border: STheme.color.card,
            header: STheme.color.primary,
            background: STheme.color.background,
            card: card,
            ...(override || {}),
            // accent: STheme.color.accent
        }
    },
    cellStyle: (override?: any) => {
        return {
            borderWidth: 0,
            justifyContent: 'center',
            // borderBottomWidth: 1,
            // borderColor:
            // borderLeftWidth: 1,
            // padding: 4,
            // justifyContent: "flex-start"
            ...(override || {}),
        }
    },
    textStyle: (override?: any) => {
        return {
            // fontFamily: "Poppins",
            fontSize: 12,
            ...(override || {}),
        }
    },
    headerStyle: (override?: any) => {
        return { alignItems: "center" }
    },
    headerTextStyle: (override?: any) => {
        return {
            fontSize: 10,
            fontWeight: "bold",
            ...(override || {}),
        }
    }
}