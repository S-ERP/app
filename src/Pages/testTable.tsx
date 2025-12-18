import React from "react";
import { SPage, SText, STheme, SView } from "servisofts-component";
import Pipeline from "../Components/Pipeline";
export default class index extends React.Component {
    render() {
        return <SPage title={"Servisofts page"} disableScroll>
            <Pipeline

                // Configuraciones de la data
                stageKeyExtractor={(stage: any) => stage.id.toString()}
                dataKeyExtractor={(data: any) => data.id.toString()}
                isInStage={(stage,data)=>stage.id ==data.stage_id}
                // dataStageKeyExtractor={(data: any) => data.stage_id.toString()}
                loadStages={async () => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return [{ id: 1, name: "Stage 1" }, { id: 2, name: "Stage 2" }];
                }}
                loadData={async () => {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return [
                        { id: 1, name: "Data 1", stage_id: 2, },
                        { id: 2, name: "Data 2", stage_id: 1 },
                        { id: 3, name: "Data 3", stage_id: 2 },
                        { id: 4, name: "Data 4", stage_id: 1 },
                        { id: 5, name: "Data 5", stage_id: 2 },
                    ];
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
        <SText>{data.name}</SText>
        <SText>{stage.name}</SText>
    </SView>
}