'use client'
import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/app/firebase/config";
import React, {FormEvent, useContext, useState} from "react";
import Button from "@/app/components/Button";
import {getDocs, setDoc, doc, collection, query, where, deleteDoc, updateDoc, arrayUnion} from "@firebase/firestore";
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore";
import {UserInterface, RequestInterface, MessageInterface} from "@/app/lib/interfaces";
import {signOut} from "firebase/auth";
import {useRouter} from "next/navigation";

import Image from "next/image";
import {SidebarContext} from "@/app/lib/contexts";

export default function Home() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [email, setEmail] = useState("");

    const [incomingRequests] = useCollectionData(query(collection(firestore, "requests"), where("receiverID", "==", user?.uid!)))
    const [outGoingRequests] = useCollectionData(query(collection(firestore, "requests"), where("senderID", "==", user?.uid!)))

    const {setIsOpen} = useContext(SidebarContext)

    const sendRequest = async (e: FormEvent) => {
        e.preventDefault();
        const userQuery = query(collection(firestore, "users"), where("email", "==", email));
        const data = await getDocs(userQuery);
        const {uid: receiverID, displayName: receiverDisplayName} = data.docs[0].data() as UserInterface;
        const {uid: senderID, displayName: senderDisplayName} = user!;
        const docData = {
            senderID,
            senderDisplayName,
            receiverID,
            receiverDisplayName
        } as RequestInterface;

        await setDoc(doc(firestore, "requests", `${senderID}-${receiverID}`), docData);

    }

    const acceptRequest = async (senderID: string, receiverID: string) => {
        await deleteDoc(doc(firestore, "requests", `${senderID}-${receiverID}`));
        await updateDoc(doc(firestore, "users", senderID), {friends: arrayUnion(receiverID)});
        await updateDoc(doc(firestore, "users", receiverID), {friends: arrayUnion(senderID)});
    }

    const rejectRequest = async (senderID: string, receiverID: string) => {
        await deleteDoc(doc(firestore, "requests", `${senderID}-${receiverID}`));
    }

    return (
        <article className="flex flex-col p-5 w-10/12 h-full">
            <button className={"px-2 group sm:hidden"} onClick={() => setIsOpen(true)}>
                <img src={"/icons/back.png"} alt="back" className="w-6 h-6 group-hover:brightness-125"/>
            </button>

            <h1 className={"p-2 text-2xl font-bold"}>Add Friend</h1>
            <p className={"p-2"}>You can add friends with their account email.</p>

            <form className="flex w-full outline outline-4 outline-offset-0 outline-tertiary rounded"
                  onSubmit={(e) => sendRequest(e)}>
                <input className="w-11/12 bg-tertiary" type="email" value={email}
                       onChange={(e) => setEmail(e.target.value)}/>
                <Button
                    text={"Add User"}/>
            </form>

            <div className={"flex flex-col p-5"}>
                <hr className={"text-[grey]"}></hr>
            </div>

            <h3 className={"p-2"}>INCOMING INVITES:</h3>
            {incomingRequests?.map((data) => {
                const {senderDisplayName, senderID} = data as RequestInterface;
                const {receiverDisplayName, receiverID} = data as RequestInterface;
                return (
                    <div key={senderID} className="flex items-center p-2">
                        <p key={senderID}> {senderDisplayName} requests to be your friend </p>
                        <button className="m-2 p-2 bg-blurple rounded"
                                onClick={() => acceptRequest(senderID, receiverID)}>Accept
                        </button>
                        <button className="m-2 p-2 bg-blurple rounded"
                                onClick={() => rejectRequest(senderID, receiverID)}>Reject
                        </button>
                    </div>
                );
            })}

            <div className={"flex flex-col p-5"}>
                <hr className={"text-[grey]"}></hr>
            </div>

            <h3 className="flex items-center p-2">OUTGOING INVITES:</h3>
            {outGoingRequests?.map((data) => {
                const {receiverDisplayName, receiverID} = data as RequestInterface;
                const {senderDisplayName, senderID} = data as RequestInterface;
                return (
                    <div key={receiverID} className="flex items-center p-2">
                        <p key={receiverID}>Sent request to {receiverDisplayName}</p>
                        <button className="m-2 p-2 bg-blurple rounded"
                                onClick={() => rejectRequest(senderID, receiverID)}>Cancel
                        </button>
                    </div>
                )
                    ;
            })}
        </article>
    )

}
