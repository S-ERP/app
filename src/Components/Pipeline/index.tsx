import React, { ReactElement } from "react";
import { ViewStyle } from "react-native";
import { FlatList, ScrollView, View } from "react-native";
import { SLoad, SPage, SText, SView } from "servisofts-component";



export type PipelineProps = {
    loadStages: () => Promise<any>;
    loadData: () => Promise<any>;
    stageKeyExtractor: (stage: any) => string;
    dataKeyExtractor: (data: any) => string;
    isInStage: (stage: any, data: any) => boolean;
    // dataStageKeyExtractor: (data: any) => string;

    renderStageHeader?: (stage: any) => React.ReactNode;
    customItem?: any;
    stageStyle?: ViewStyle;
    cardStyle?: ViewStyle;
}

export default class Pipeline extends React.Component<PipelineProps> {

    state = {
        stages: null as any,
        data: null as any,
    }
    stageStyle = this.props.stageStyle || { width: 200, flex: 1, borderWidth: 1, borderColor: "#fff", margin: 5 }
    componentDidMount(): void {
        this.loadData();
    }

    loadData = async () => {
        const stages = await this.props.loadStages();
        this.setState({ stages });
        const data = await this.props.loadData();
        this.setState({ data });
    }

    render() {
        return <ScrollView style={{
            width: "100%",
            flex: 1,
        }} horizontal>
            {this.state.stages == null && new Array(5).fill(0).map((_, i) => {
                return <SLoad key={i} type="skeleton" style={{ ...this.stageStyle }} />
            })}
            {this.state.stages != null && this.state.stages.map((stage: any) => {
                const key = this.props.stageKeyExtractor(stage)
                return <Stage key={key} pipeline={this} stage={stage} />
            })}
        </ScrollView>
    }
}

const Stage = (props: { pipeline: Pipeline, stage: any }) => {
    const data = props.pipeline.state.data;
    return <View style={{ ...props.pipeline.stageStyle }}>
        {props.pipeline.props.renderStageHeader ? props.pipeline.props.renderStageHeader(props.stage) : <SText>{props.stage.name}</SText>}
        {data == null && <FlatList
            data={new Array(
                Math.floor(Math.random() * 5) + 1
            ).fill(0)}
            renderItem={({ item }) => {
                return <SView style={{ ...props.pipeline.props.cardStyle }}  >
                    <SLoad type="skeleton" style={{ width: "100%", height: "100%" }} />
                </SView>
            }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />}
        {data != null &&
            <FlatList
                data={data.filter((d: any) => props.pipeline.props.isInStage(props.stage, d))}
                renderItem={({ item }) => {
                    return <Item data={item} pipeline={props.pipeline} stage={props.stage} />
                }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                keyExtractor={(item) => props.pipeline.props.dataKeyExtractor ? props.pipeline.props.dataKeyExtractor(item) : item.id.toString()}
            />
        }

    </View>
}
const Item = (props: { data: any, pipeline: Pipeline, stage: any }) => {
    const ITEM = props.pipeline.props.customItem as any;
    return <SView style={props.pipeline.props.cardStyle}>
        {ITEM ? <ITEM data={props.data} stage={props.stage} pipeline={props.pipeline} /> : <SText>{props.data.name}</SText>}
    </SView>
}