import React from 'react';
import { Image, View, Text } from 'react-native';
import { SUuid } from 'servisofts-component';
import SVideo from '..';
export default class SVideoPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            error: null,
            id: SUuid()
        };
    }

    componentDidMount() {
        // const { obj, path } = this.props;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.props.src, true);
        const size = 1024 * 1024;
        console.log(size)
        console.log(this.props.size)
        xhr.setRequestHeader('Range', `bytes=0-${this.props.size <= size ? "" : size}`);
        xhr.responseType = 'blob';

        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 206) {
                const blob = xhr.response;
                const reader = new FileReader();
                reader.onloadend = () => {
                    // console.log(reader.result)
                    // const path = `file://${RNFS.DocumentDirectoryPath}/${this.state.id}.mp4`
                    // const b64 = reader.result.split("base64,")[1];
                    this.setState({ image: reader.result });
                    // RNFS.writeFile(path, b64, 'base64')
                    //     .then(success => {

                    //         this.setState({ image: path });
                    //         console.log('FILE WRITTEN: ', path)
                    //     })
                    //     .catch(err => {
                    //         console.log('File Write Error: ', err.message)
                    //     })
                };
                reader.readAsDataURL(blob);
            } else {
                this.setState({ error: 'Error fetching video preview' });
                console.error('Error fetching video preview:', xhr.statusText);
            }
        };

        xhr.onerror = () => {
            this.setState({ error: 'Network error' });
            console.error('Network error');
        };

        xhr.send();
    }

    render() {
        const { image, error } = this.state;
        return (
            <View style={{
                width: "100%",
                height: "100%",
                // backgroundColor: "#000",
            }}>
                {error && <Text style={{ color: "#fff" }}>{error}</Text>}
                {image ? (
                    <SVideo paused={false} src={image} muted={true} />
                    //   <Image
                    //     source={{ uri: image }}
                    //     style={{ width: 200, height: 200 }}
                    //   />
                ) : null}
            </View>
        );
    }
}
