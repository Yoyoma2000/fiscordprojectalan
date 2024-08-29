'use client'
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/app/firebase/config";
import React, {useState} from "react";
import {signOut} from "firebase/auth";
import {useRouter} from "next/navigation";
import Button from "@/app/components/Button";
import {addDoc, collection, orderBy, query, Timestamp, doc} from "@firebase/firestore";
import {useCollectionData, useDocumentData, } from "react-firebase-hooks/firestore";
import {MessageInterface} from "@/app/lib/interfaces";
import Image from "next/image";

export default function Home() {

    const [user, loading] = useAuthState(auth);
    const [userData] = useDocumentData(doc(firestore, "users", user?.uid!));

    const router = useRouter();
    const [text, setText] = useState("");
    const [messages] = useCollectionData(query(collection(firestore,"messages"), orderBy("createdAt", "asc")), {snapshotOptions: {serverTimestamps: "estimate"}});
    const sendMessage = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("sent message");
        setText("");
        const doc = {
            text,
            createdAt: Timestamp.fromDate(new Date())
        } as MessageInterface
        await addDoc(collection(firestore, "messages"), doc)
    }

  return (
        <div className={"w-10/12 flex flex-col justify-end p-5"}>
            <div className={"bg-main-text-box m-2.5 outline outline-offset-2 outline-line rounded"}>


                {messages?.map((data, i) => {
                        const {text, createdAt} = data as MessageInterface;
                        const {displayName, photoURL} = userData!;

                        return (
                            <span key={i} className={"flex"}>
                                <img src={photoURL}
                                     alt={"ProfilePic"}
                                     className="h-6 w-6 rounded-full mr-3 my-auto"/>

                                <p className={"p-1"}>
                                    {displayName}: {text}
                                </p>
                            </span>
                        )
                })}

            </div>

            <form onSubmit={sendMessage} className={"m-2.5 outline outline-offset-2 outline-line rounded"}>
                <input className={"w-1/12 bg-blurple hover:bg-blurple-hover active:bg-blurple-active rounded"}
                       type={"submit"} value={"Send"}></input>
                <input className={"w-11/12 bg-main-text-box rounded"} value={text}
                       onChange={(e) => setText(e.target.value)}></input>
            </form>
        </div>
  );
}
