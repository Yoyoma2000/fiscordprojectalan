'use client'
import Button from "@/app/components/Button";
import {useRouter} from "next/navigation";
import {auth, firestore} from "@/app/firebase/config";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React, {useState} from "react";
import {UserInterface} from "@/app/lib/interfaces";
import {doc, setDoc} from "@firebase/firestore";

export default function EmailLogin() {
    const router = useRouter();
    const [textEmail, setTextEmail] = useState("");
    const [textPassword, setTextPassword] = useState("");
    //const [createEmailPassword, user, loading, error] = createUserWithEmailAndPassword(auth,'','');
    //const [signInWithEmailPassword, user, loading, error] = signInWithEmailAndPassword(auth, '', '');

    const signIn = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await signInWithEmailAndPassword(auth, textEmail, textPassword);
        if (result) {
            router.push("/");
        }

    }

    const createNew = async (event: React.FormEvent) => {
        event.preventDefault();
        const result = await createUserWithEmailAndPassword(auth, textEmail, textPassword);
        const {uid, displayName, photoURL, email} = result?.user!;
        const docData = {
            uid,
            displayName: email,
            photoURL: "https://ia600305.us.archive.org/31/items/discordprofilepictures/discordblue.png",
            email
        } as UserInterface;
        await setDoc(doc(firestore, "users", uid), docData); // Dont need {merge: true} to prevent friend-list wipe because sign in function above wont wipe
        if (result) {
            router.push("/");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-3/12 p-12 rounded shadow-md bg-drawer flex flex-col items-center">

                <h2 className="mb-4 text-4xl font-bold text-center flex justify-center items-center">Login with
                    Email/Password</h2>

                <div className={"flex"}>
                    <form onSubmit={signIn} className="flex flex-col items-center space-y-2 p-10">
                        <input className={"w-12/12 bg-main-text-box rounded"} value={textEmail}
                               onChange={(e) => setTextEmail(e.target.value)}></input>
                        <input className={"w-12/12 bg-main-text-box rounded"} value={textPassword}
                               onChange={(e) => setTextPassword(e.target.value)}></input>
                        <input className={"w-10/12 bg-blurple hover:bg-blurple-hover active:bg-blurple-active rounded"}
                               type={"submit"} value={"Sign In"}></input>
                    </form>

                    <form onSubmit={createNew} className="flex flex-col items-center space-y-2 p-10">
                        <input className={"w-12/12 bg-main-text-box rounded"} value={textEmail}
                               onChange={(e) => setTextEmail(e.target.value)}></input>
                        <input className={"w-12/12 bg-main-text-box rounded"} value={textPassword}
                               onChange={(e) => setTextPassword(e.target.value)}></input>
                        <input className={"w-10/12 bg-blurple hover:bg-blurple-hover active:bg-blurple-active rounded"}
                               type={"submit"} value={"Create New"}></input>
                    </form>
                </div>


                <Button text="Go back" onClick={() => {
                    router.push("/login");
                }}/>

            </div>
        </div>
    );
}