import React, { Component } from 'react';
import { SUploadFileDropProps } from "./type";

export default class SUploadFileDrop extends Component<SUploadFileDropProps> {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
        };
    }

    handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ isDragging: true });
    };

    handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ isDragging: false });
    };

    handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ isDragging: false });
        const items = e.dataTransfer.items;
        if (items && items.length > 0) {
            this.handleItems(items);
        }
    };

    handleItems = (items) => {
        const files = [];
        let pending = items.length;

        const traverseFileTree = (item, path = "") => {
            if (item.isFile) {
                item.file((file) => {
                    file.fullPath = path + file.name; // Add the full path to the file object
                    console.log(file);
                    files.push(file);
                    pending--;
                    if (pending === 0 && this.props.onChange) {
                        this.props.onChange(files);
                    }
                });
            } else if (item.isDirectory) {
                const dirReader = item.createReader();
                dirReader.readEntries((entries) => {
                    pending += entries.length - 1; // Adjust pending count for directory entries
                    for (let i = 0; i < entries.length; i++) {
                        traverseFileTree(entries[i], path + item.name + "/");
                    }
                });
            }
        };

        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                traverseFileTree(item);
            } else {
                pending--; // Adjust pending count for unsupported items
            }
        }
    };

    render() {
        const { isDragging } = this.state;

        return (
            <>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        onDragEnter={this.handleDragEnter}
                        onDragLeave={this.handleDragLeave}
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDrop}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'all',
                            backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                            border: isDragging ? '2px dashed #000' : 'none',
                            zIndex: 1000,
                        }}
                    >
                        {this.props.children}
                    </div>
                </div>
            </>
        );
    }
}
