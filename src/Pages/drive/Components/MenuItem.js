import { SNotification, SPopup, STheme } from 'servisofts-component';
import { Actions } from '..';
import ChangeName from './ChangeName';
import SSocket from 'servisofts-socket';
import SCopy from '../../../Components/SCopy';
import Move from './Move';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import Analisis from './Analisis';

export default class MenuItem {
    static open({ e, obj, path, onEvent }) {
        const handleEliminar = () => {
            if (onEvent) {
                let name = obj.name;
                let pathfinal = !path ? name : path + "/" + name;
                pathfinal = Actions.root_path + pathfinal;
                Actions.rm({ path: pathfinal }).then(() => {
                    onEvent("delete");
                }).catch(err => {
                    SNotification.send({
                        title: "Error",
                        body: err.error,
                        color: STheme.color.danger,
                        time: 5000,
                    });
                    console.error(err);
                });
            }
        };

        const handleEnviarAPapelera = () => {
            if (onEvent) {
                let name = obj.name;
                let pathfinal = !path ? name : path + "/" + name;
                Actions.papelera({ path: pathfinal }).then(() => {
                    onEvent("delete");
                }).catch(err => {
                    SNotification.send({
                        title: "Error",
                        body: err.error,
                        color: STheme.color.danger,
                        time: 5000,
                    });
                    console.error(err);
                });
            }
        };

        const handleCambiarNombre = () => {
            ChangeName.open({ path: Actions.root_path + "" + path, obj, onEvent });
        };

        const handleMover = () => {
            Move.open({ path, obj, onEvent });
        };

        const handleCopiarVinculo = () => {
            let finalPath = Actions.root_path + path;
            if (path.startsWith("/")) finalPath = finalPath.slice(1);
            const DiverPath = SSocket.api.drive + finalPath;
            const compress = "compress=zip";
            let fullpath = obj.type === "directory"
                ? DiverPath + "/" + obj.name + "?" + compress
                : DiverPath + "/" + obj.name;
            SCopy.copy(fullpath).then(() => {
                console.log(fullpath);
            }).catch(() => { });
        };
        const handleAnalizar = () => {
            let finalPath = Actions.root_path + path;
            if (path.startsWith("/")) finalPath = finalPath.slice(1);
            const DiverPath = SSocket.api.drive + finalPath;
            const compress = "compress=zip";
            let fullpath = obj.type === "directory"
                ? DiverPath + "/" + obj.name + "?" + compress
                : DiverPath + "/" + obj.name;
            // SCopy.copy(fullpath).then(() => {
            //     console.log(fullpath);
            // }).catch(() => { });
            Actions.video_analizar({ path: fullpath, path_file: Actions.root_path + "" + path + "/" + obj.name }).then((data) => {

            }).catch((e) => {
                SNotification.send({
                    title: "Error",
                    body: e.error,
                    color: STheme.color.danger,
                    time: 5000,
                });
                console.error(e);
            })
        }
        const handleGetAnalisis = () => {
            Analisis.open({ path: path, obj });

        }

        FloatMenu.open({
            e,
            label: obj.name,
            options: [
                { label: "Copiar el vínculo", onPress: handleCopiarVinculo, icon: <SIconApp name='World' /> },
                { label: "Cambiar nombre", onPress: handleCambiarNombre, icon: <SIconApp name='Edit' /> },
                { label: "Mover", onPress: handleMover, icon: <SIconApp name='blender/scene' /> },
                { label: "Eliminar", onPress: handleEliminar, icon: <SIconApp name='Delete' /> },
                { label: "Analizar", onPress: handleAnalizar, icon: <SIconApp name='Ajustes' /> },
                { label: "GetAnalisis", onPress: handleGetAnalisis, icon: <SIconApp name='Ajustes' /> },
                // { label: "Enviar a la papelera", onPress: handleEnviarAPapelera, icon: <SIconApp name='Trash'/> },
            ]
        });
    }
}
