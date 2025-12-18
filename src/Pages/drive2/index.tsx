import React from "react";
import { SPage, SText } from "servisofts-component";
import ResizeDualPanel from "./ResizeDualPanel";
import { ScrollView, View } from "react-native";
import FileItem from "./FileItem";
import FilePreview from "./FilePreview";

export default class index extends React.Component {

    state = {
        selectedFile: null as string | null
    }

    filePreview: FilePreview | undefined;
    renderContent1 = () => {
        return <View style={{ width: "100%", height: "100%", }}>
            <ScrollView style={{ width: "100%", height: "100%" }} horizontal
                contentContainerStyle={{
                    minWidth: "100%",
                    height: "100%",
                }}>
                <ScrollView >
                    <FileItem 
                        path="" 
                        name="" 
                        open 
                        type="directory" 
                        selectedPath={this.state.selectedFile}
                        onSelect={(path) => this.setState({ selectedFile: path })}
                        onOpen={(file) => {
                            this.setState({ selectedFile: file.path ?? "" });
                            if (this.filePreview) this.filePreview.selectFile(file);
                        }} 
                    />
                </ScrollView>
            </ScrollView>
        </View>
    }
    renderContent2 = () => {
        return <FilePreview ref={ref => this.filePreview = ref as FilePreview} />
    }
    render() {
        return <SPage title={"Drive"} disableScroll>
            <ResizeDualPanel
                startX={200}
                content1={this.renderContent1()}
                content2={this.renderContent2()}
            />
        </SPage>;
    }
}