import { SDate, SMath } from "servisofts-component"
import { Text, View, toJson } from "servisofts-rn-spdf"

export default (data) => {
    return <View style={{
        width: "100%",
        height: 20
    }}>
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>Header</Text>
    </View>
}