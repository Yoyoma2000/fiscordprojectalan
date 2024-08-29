'use client'
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore, storage} from "@/app/firebase/config";
import React, {createRef, RefObject, useContext, useEffect, useRef, useState} from "react";
import {signOut} from "firebase/auth";
import {useRouter, useSearchParams} from "next/navigation";
import Button from "@/app/components/Button";
import {
    getDocs,
    addDoc,
    collection,
    orderBy,
    query,
    Timestamp,
    doc,
    updateDoc,
    DocumentData, deleteDoc
} from "@firebase/firestore";
import {useCollection, useCollectionData, useDocumentData} from "react-firebase-hooks/firestore";
import {FileInterface, MessageInterface} from "@/app/lib/interfaces";
import {useUploadFile} from "react-firebase-hooks/storage";
import {getDownloadURL, ref} from "@firebase/storage";
import Image from "next/image";
import MessageCard from "@/app/components/MessageCard";
import {SidebarContext} from "@/app/lib/contexts";
import {fetchBlurImage, getImageDimension} from "@/app/lib/utils";
import {Dimension} from "@/app/lib/interfaces";
import {Dialog, DialogBackdrop, DialogPanel} from "@headlessui/react";
import Link from "next/link";

export default function DM() {
    const [user, loading] = useAuthState(auth);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [text, setText] = useState("");
    const [userData] = useDocumentData(doc(firestore, "users", user?.uid!));
    const [friendData] = useDocumentData(doc(firestore, "users", searchParams.get("id")!));
    const dmId = [searchParams.get("id"), user?.uid].toSorted().join("-");
    const [messages] = useCollection(query(collection(firestore, "dm", dmId, "messages"), orderBy("createdAt", "desc")));
    // useCollectionData(query(collection(firestore,"messages"), orderBy("createdAt", "asc")), {snapshotOptions: {serverTimestamps: "estimate"}});

    const [editMessage, setEditMessage] = useState("");
    const [editMessageId, setEditMessageId] = useState("");
    const editBoxes = useRef<Map<string, RefObject<HTMLInputElement>>>(new Map());

    const [file, setFile] = useState<File | undefined>(undefined);
    const [uploadFile] = useUploadFile();
    const textBox = createRef<HTMLInputElement>();

    const {setIsOpen} = useContext(SidebarContext)
    const MAX_IMG_SIZE = 240

    const [zoomImage, setZoomImage] = useState("");
    const [enableZoom, setEnableZoom] = useState(false);

    const SCROLL_LOAD_BUFFER = 200;
    const MESSAGE_LOAD_AMT = 20;
    const [messageLimit, setMessageLimit] = useState(MESSAGE_LOAD_AMT);
    const [savedMessages, setSavedMessages] = useState(messages);


    useEffect( () => {
        function handleKeyDown(ev: KeyboardEvent) {
            editMessageId == "" ? textBox.current?.focus() : editBoxes.current.get
            if (ev.key == "Escape" && editMessageId) {
                setEditMessageId("");
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {window.removeEventListener("keydown", handleKeyDown);}
    })

    useEffect(() => {
        setText("");
    }, [dmId]);

    useEffect(() => {
        if (messages) {
            setSavedMessages(messages)
        }
    }, [messages]);

    const sendMessage = async (event: React.FormEvent) => {
        event.preventDefault();
        if(!text && !file) {
            return
        }
        console.log("sent message");
        setText("");
        const {uid, displayName, photoURL} = user!;
        const doc = {
            uid,
            displayName,
            photoURL,
            text,
            createdAt: Timestamp.fromDate(new Date()),
            edited:false
        } as MessageInterface

        console.log(file?.type)

        if (file) {
            const tile = file;
            setFile(undefined);
            const type = tile.type.includes("image") ? "image" : "file";
            const path = `${type}/${dmId}/${tile.name}`
            await uploadFile(ref(storage, path), tile);
            const url =  await getDownloadURL(ref(storage, path));
            doc.file = {url, type, name: tile.name, size: tile.size}
            if (type == "image") {
                const url = URL.createObjectURL(tile);
                const {width, height} = await getImageDimension(MAX_IMG_SIZE, url);
                const placeholder = await fetchBlurImage(url)
                doc.file = {width, height, placeholder, ...doc.file}
            }

        }
        await addDoc(collection(firestore, "dm", dmId, "messages"), doc)
    }

    const resendMessage = async (message: string, mid: string, msgData: DocumentData) => {
        await updateDoc(doc(firestore, "dm", dmId, "messages", mid), {...msgData, text:message, edited:true} );
        setEditMessageId("");
    }

    const deleteMessage = async (mid: string) => {
        await deleteDoc(doc(firestore, "dm", dmId, "messages", mid));
    }

    const loadMoreMessage = (e: React.UIEvent) => {
        const { scrollTop, scrollHeight, clientHeight} = e.target as HTMLOListElement;
        if (scrollHeight <= clientHeight - scrollTop + SCROLL_LOAD_BUFFER && messageLimit <= messages?.size!)
        {
            setMessageLimit(messageLimit + MESSAGE_LOAD_AMT);
        }
    }

    return (
        <div className={"w-full flex flex-grow flex-col h-full"}>
            <header className={"border-tertiary border-b h-10 min-h-10 flex items-center justify-between px-5"}>
                <button className={"px-2 group sm:hidden"} onClick={() => setIsOpen(true)}>
                    <img src={"/icons/back.png"} alt="back" className="w-6 h-6 group-hover:brightness-125" />
                </button>
                <span className={"flex"}>
                    <img src={friendData?.photoURL} alt={friendData?.photoURL} className={"h-6 w-6 rounded-full mr-3 my-auto"} />
                    <p>{friendData?.displayName}</p>
                </span>
            </header>


            <ol className={"bg-main-text-box m-2.5 outline outline-offset-2 outline-line rounded overflow-y-auto flex flex-col flex-col-reverse flex-grow"}  onScroll={loadMoreMessage}>
                {savedMessages?.docs.map((doc, i) => {
                    const messageData = doc.data({serverTimestamps: "estimate"}) as MessageInterface;
                    const id = doc.id;
                    const ref = createRef<HTMLInputElement>();
                    editBoxes.current.set(id, ref);
                    return (
                        <MessageCard key={id} messageData={messageData} hasOwnership={user?.uid == messageData.uid}
                                     enableEdit={() => setEditMessageId(id)} isEdit={editMessageId == id}
                                     editMessage={editMessage} setEditMessage={setEditMessage} editRef={ref}
                                     resendFn={(msg) => resendMessage(msg, id, messageData)}
                                     deleteFn={() => deleteMessage(id)}
                                     setZoomImage={() => {
                                         setZoomImage(messageData.file?.url ?? "")
                                         setEnableZoom(true);
                                     }}

                        />
                    )
                })}
            </ol>

            <form onSubmit={sendMessage} className={"m-2.5 flex outline outline-offset-2 outline-line rounded"}>
                {file && <FileBox file={file}/>}
                <div className={"flex w-1/12 group justify-center items-center"}>
                    <label htmlFor={"fileButton"} className={"group hover:cursor-pointer"}>
                        <img src={"/icons/upload.png"} alt="upload"
                             className="w-6 h-6 group-hover:brightness-125"></img>
                    </label>
                    <input type={"file"} className={"hidden w-0"} id="fileButton"
                           onChange={(e) => {
                               console.log(e.target.files?.[0]);
                               setFile(e.target.files?.[0])
                               e.target.value = "";
                           }
                    }/>
                </div>

                <input className={"w-1/12 min-w-15 bg-blurple hover:bg-blurple-hover active:bg-blurple-active rounded"}
                       type={"submit"} value={"Send"}></input>
                <input type={"text"} ref={textBox}
                       className={"w-10/12 bg-main-text-box rounded"} value={text}
                       onChange={(e) => setText(e.target.value)}/>
            </form>

            <Dialog onClose={() => setEnableZoom(false)} open={enableZoom} transition
                className="relative z-50 transition duration-200 ease-in-out data-[closed]:opacity-0">
                <DialogBackdrop className="fixed inset-0 bg-black/60"/>
                <div className="fixed inset-0 flex flex-col w-screen items-center justify-center p-10">
                    <DialogPanel as="div" className="max-h-full max-w-4/6">
                        <img src={zoomImage} alt="Scaled Image" className="object-scale-down max-h-full max-w-4/6"/>
                        <Link href={zoomImage!} target="_blank"
                            className="text-tertiary-text hover:text-secondary-text hover:underline active:text-white">
                            Open In Browser</Link>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>

    );

    function FileBox({file}: { file: File }) {
        return (
            <>
                <div className={"w-72 h-72 rounded-xl m-4 bg-primary flex flex-col justify-center items-center relative"}>
                    {
                        file.type.includes("image") ?
                                <img src={URL.createObjectURL(file)} alt={file.name}
                                    className={"object-contain rounded-xl w-60 h-60 m-2 bg-line"} /> :
                                <img src={"/icons/file.png"}  alt={file.name}
                                    className={"object-contain rounded-xl w-60 h-60 m-2 bg-line"} />
                    }
                    <p>{file.name}</p>
                </div>
                <hr className = "text-line rounded-full mx-2"></hr>
            </>
        )
    }
}
