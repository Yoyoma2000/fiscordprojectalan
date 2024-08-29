import {Timestamp} from "@firebase/firestore";

export interface MessageInterface {
    uid: string,
    displayName: string,
    photoURL: string,
    text: string,
    createdAt: Timestamp,
    file?: FileInterface,
    edited?: boolean
}

export interface FileInterface {
    url: string,
    type: "file" | "image",
    name: string,
    size: number,
    width?: number,
    height?: number,
    placeholder?: string,
}

export interface UserInterface {
    uid: string,
    displayName: string,
    photoURL: string,
    email: string,
    friends: string[]
}

export interface RequestInterface {
    senderID: string,
    receiverID: string,
    senderDisplayName: string,
    receiverDisplayName: string
}

export interface Dimension {
    width: number;
    height: number;
}