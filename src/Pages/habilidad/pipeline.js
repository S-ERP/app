import React from "react";
import { SPage, SText, STheme, SView } from "servisofts-component";
import Pipeline from "../../Components/Pipeline";
import MDL from "../../MDL";
export default class index extends React.Component {
    render() {
        return <SPage title={"Servisofts page"} disableScroll>
            <Pipeline

                // Configuraciones de la data
                stageKeyExtractor={(stage: any) => stage.key.toString()}
                dataKeyExtractor={(data: any) => data.key.toString()}
                isInStage={(stage, data) => {
                    return stage.usuarios.includes(data.key);
                }}
                loadStages={async () => {
                    const habilidad = await MDL.habilidad.getAllWithUsuarios();
                    return habilidad.map((obj: any) => {
                        return { key: obj.key, name: obj.descripcion, usuarios: obj.key_usuarios || []}
                    });
                }}
                loadData={async () => {
                    const usuarios = await MDL.usuario.getAll()
                    return Object.values(usuarios)
                }}
                //Configuraciones de estilos
                stageStyle={{
                    width: 250,
                    margin: 5,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    borderRadius: 8,
                    padding: 8,
                    // backgroundColor:STheme.color.background,
                }}
                cardStyle={{
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    // padding: 8,
                    minHeight: 60,
                }}
                renderStageHeader={(stage) => {
                    return <SView col={"xs-12"} height={40} center>
                        <SText>{stage.name}</SText>
                    </SView>
                }}
                customItem={ElementItem}



            />
        </SPage>
    }
}

const ElementItem = (props: any) => {
    const { stage, pipeline, data } = props;
    return <SView col={"xs-12"} flex center >
        <SText>{data.Nombres} {data.Apellidos}</SText>
        {/* <SText>{stage.name}</SText> */}
    </SView>
}