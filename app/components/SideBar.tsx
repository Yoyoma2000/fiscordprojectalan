import {useAuthState} from "react-firebase-hooks/auth";
import {auth, firestore} from "@/app/firebase/config";
import {useDocumentData} from "react-firebase-hooks/firestore";
import {doc} from "@firebase/firestore";
import {UserInterface} from "@/app/lib/interfaces";
import Button from "@/app/components/Button";
import React, {useContext} from "react";
import {signOut} from "firebase/auth";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {SidebarContext} from "@/app/lib/contexts";

export default function SideBar() {
    const [user] = useAuthState(auth);
    const [userData] = useDocumentData(doc(firestore, "users", user?.uid!));
    const router = useRouter();
    const {setIsOpen} = useContext(SidebarContext);

    return (
        <section className="flex flex-col items-center h-full bg-secondary">
            <div className={"h-5/6 flex flex-col items-center w-full"}>
                <button className="w-full flex justify-center items-center bg-drawer hover:bg-active-l rounded p-2.5" onClick={() => {
                    router.push("/");
                    setIsOpen(false);
                }}>Friend Invites</button>
                {(userData as UserInterface)?.friends?.map((uid) => {
                    return (

                        <FriendCard key={uid} uid={uid}/>

                    )
                })}
            </div>
            <div className={"flex flex-col items-center justify-end p-10"}>
                Hello user {userData?.displayName}

                <Button text={"Log out"} style={"px-10 py-3 m-4"} onClick={() => {
                    router.push("/login");
                    signOut(auth);
                }}></Button>
            </div>
        </section>
    )
}

function FriendCard({uid}: { uid: string }) {
    const [userData] = useDocumentData(doc(firestore, "users", uid!));
    const router = useRouter();
    const {setIsOpen} = useContext(SidebarContext);
    return (
        <Link href={"/dm?id="+uid} className="w-full flex justify-center items-center hover:bg-active-l p-1"
              onClick={()=> setIsOpen(false)}>
            <img src={userData?.photoURL}
            alt={"ProfilePic"} className="h-6 w-6 rounded-full mr-3 my-auto"/>
            {userData?.displayName}
        </Link>
    )
}