import Folder, { ReactComponent as FolderW } from './folder.svg';
import Menu, { ReactComponent as MenuW } from './menu.svg';
import File, { ReactComponent as FileW } from './file.svg';
import Drive, { ReactComponent as DriveW } from './drive.svg';

export default {
    "drive-folder": { Native: Folder, Web: FolderW },
    "drive-menu": { Native: Menu, Web: MenuW },
    "drive-file": { Native: File, Web: FileW },
    "drive-icon": { Native: Drive, Web: DriveW }
}