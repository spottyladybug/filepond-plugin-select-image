// @ts-ignore
import { FilePondOptions, FilePondFile } from 'filepond';

declare module 'filepond' {
    export interface FilePondOptions {
        /** Enable or disable image selecting */
        allowImageSelect?: boolean;
        selectCallback?: (file: FilePondFile) => void;
        selectImageButtonPosition?: string;
        selectImageButtonTitle?: string;
        selectImageButtonIcon?: string;
    }
}