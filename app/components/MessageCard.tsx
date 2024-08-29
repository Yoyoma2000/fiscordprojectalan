import {MessageInterface} from "@/app/lib/interfaces";
import moment from "moment";
import Link from "next/link";
import {RefObject} from "react";
import {prettyByteSize} from "@/app/lib/utils"
import Image from "next/image";
import * as querystring from "node:querystring";

interface MessageCardInterface {
    messageData: MessageInterface,
    hasOwnership: boolean,
    editMessage: string,
    setEditMessage: (text: string) => void,
    enableEdit: () => void,
    isEdit: boolean,
    editRef: RefObject<HTMLInputElement>,
    resendFn: (text: string) => Promise<void>,
    deleteFn: (text: string) => Promise<void>,
    setZoomImage: () => void
}

export default function MessageCard({
                                        messageData: {photoURL, displayName, createdAt, file, text, edited},
                                        isEdit,
                                        hasOwnership,
                                        enableEdit,
                                        editRef,
                                        setEditMessage,
                                        editMessage,
                                        resendFn,
                                        deleteFn,
                                        setZoomImage
                                    }: MessageCardInterface) {
    return (
        <li className={"flex my-2 hover:bg-hover-d relative group"}>
            <img src={photoURL} alt={displayName} className="max-w-10 max-h-10 rounded-full mx-4"/>
            <div className={"flex flex-col grow"}>
                <span className={"inline-block"}>
                    <span className="mr-1">{displayName}</span>
                    <span
                        className={"text-tertiary-text text-xs"}>{moment(createdAt.toDate()).format("DD/MM/YYYY LT")}</span>
                </span>
                {isEdit ?
                    <form className={"flex flex-col bg-main-text-box rounded-xl p-2 mr-2"} onSubmit={(e) => {
                        e.preventDefault();
                        resendFn(editMessage);
                    }}>
                        <input className={"appearance-none outline-none bg-main-text-box flex grow"}
                               value={editMessage} onChange={(e) => setEditMessage(e.target.value)}
                               ref={editRef}
                        />
                        <input className={"invisible w-0 h-0"} type={"submit"}/>
                    </form>
                    :
                    <p>
                        {text}
                        {edited && " edited"}
                    </p>

                }

                {file && (file.type == "image" ?
                    <Image src={file.url} alt={"image"} className={"object-contain"} width={file.width!}
                           height={file.height!}
                           placeholder={"blur"} blurDataURL={file.placeholder}
                           onClick={setZoomImage}
                    />
                    :
                    <div>
                        <Link
                            className={"text-blurple hover:text-blurple-hover hover:underline active:text-burple-active"}
                            href={file?.url!}>file?.name</Link>
                        <p className={"text-sm"}>{prettyByteSize(file?.size ?? 0)}</p>
                    </div>)}
            </div>
            {hasOwnership &&
                <div
                    className={"flex bg-secondary absolute right-8 -top-2 invisible group-hover:visible p-2 rounded-lg gap-2"}>
                    <img src={"/icons/edit.png"} className={"w-6 h-6 hover:brightness-125 hover:cursor-pointer"}
                         onClick={() => {
                             enableEdit()
                             setEditMessage(text);
                         }}/>
                    <img src={"/icons/cancel.png"} className={"w-6 h-6 hover:brightness-125 hover:cursor-pointer"}
                         onClick={() => {
                             deleteFn(editMessage)
                         }}/>
                </div>}
        </li>
    )

}