import { SUuid } from "servisofts-component";
import SUploadContainer from "./SUploadContainer";
import UploadTask from "./UploadTask";
import SUploadFileDrop from "./SUploadFileDrop"
import FileChooser from "./FileChooser";
import { FileChooserProps } from "./FileChooser/type";


// export type FileUri = {
//     uri: string,
//     file: File
// }

export type SUploadProps = {
    host: string, path: string, file: File
}


export type UploadEventTypes = 'progress' | 'pause' | 'resume' | 'complete';
export type UploadEventHandler = (event: UploadEvent) => void;

export interface UploadEvent {
    type: UploadEventTypes;
    progress?: number; // Para eventos de progreso
    taskId: string;
}

export const DBUploadTask: { [key: string]: UploadTask } = {}


const submitFile = (props: SUploadProps) => {
    const obj = new UploadTask(props);
    DBUploadTask[obj.key] = obj;
    obj.start();
    return obj;
    // obj.start();
}

const addEventListener = (key: string, eventType: UploadEventTypes, handler: UploadEventHandler) => {
    const task = DBUploadTask[key];
    if (task) {
        task.on(eventType, handler);
    }
};


export { SUploadContainer, submitFile, UploadTask, SUploadFileDrop }


const SUpload = {
    async choose(props: FileChooserProps) {
        return await FileChooser(props)
    },
    submitFile: submitFile

}
export default SUpload;