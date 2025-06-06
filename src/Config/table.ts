import { STheme } from "servisofts-component"

export default {
    colors: () => {
        const card = STheme.getTheme() == "dark" ? "#FFFFFF66" : "#00000066";
        return {
            text: STheme.color.text,
            border: STheme.color.card,
            header: STheme.color.card,
            background: STheme.color.background,
            card: card,
            accent: STheme.color.accent
        }
    },
    cellStyle: () => {
        return {
            borderWidth: 0,
            borderBottomWidth: 1,
            borderLeftWidth: 1,
            // padding: 4,
            // justifyContent: "flex-start"
        }
    },
    textStyle: () => {
        return {
            fontFamily: "Poppins",
            fontSize: 12,
        }
    }
}