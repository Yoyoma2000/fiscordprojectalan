import {Dimension} from "@/app/lib/interfaces";
import pica from "pica";

export function prettyByteSize(bytes: number, separator = ` `, postFix = ``) {
    if (bytes) {
        const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.min(parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10), sizes.length - 1);
            return `${(bytes / (1024 ** 1)).toFixed(1 ? 1 : 0)}${separator}${sizes[i]}${postFix}`;
    }
    return 'n/a';
}

export function getImageDimension(maxSize: number, url: string): Promise<Dimension> {
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width < height) {
                width = maxSize * width / height
                height = maxSize
            } else {
                height = maxSize * height / width
                width = maxSize
            }
            resolve({width, height})
        }

        img.onerror = reject
        img.src = url;
    })
}

export async function fetchBlurImage(url: string): Promise<string> {
    const resizedCanvas = document.createElement('canvas')
    resizedCanvas.height = 32
    resizedCanvas.width = 32
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.onload = async () => {
            await pica().resize(img, resizedCanvas);
            resolve(resizedCanvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = url;
    });
}