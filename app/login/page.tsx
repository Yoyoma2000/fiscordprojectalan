'use client'
import {auth, firestore} from "@/app/firebase/config";
import {useSignInWithGoogle} from "react-firebase-hooks/auth";
import {sign} from "node:crypto";
import Button from "@/app/components/Button";
import {useRouter} from "next/navigation";
import {UserInterface} from "@/app/lib/interfaces";
import {doc, setDoc} from "@firebase/firestore";

export default function Login() {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

    const router = useRouter();
    const signIn = async () => {
        const result = await signInWithGoogle();
        if(!result?.user) {
            return
        }
        const {uid, displayName, photoURL, email} = result?.user!;
        const docData = {
            uid,
            displayName,
            photoURL,
            email } as UserInterface;
        await setDoc(doc(firestore, "users", uid), docData, {merge: true});
        if (result) {
            router.push("/");
        }
    }

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-80 p-12 rounded sm:shadow-md sm:bg-drawer flex flex-col items-center space-y-5">
                <h2 className="mb-4 text-4xl font-bold text-center flex justify-center items-center">Fiscord</h2>
                <Button text="Log in with Google" onClick={signIn} loading={loading}/>
                {error && <p className="text-sm text-warning">Sign in failed.</p>}
                <Button text="Log in with Email+PS" onClick={() => {
                    router.push("/login/emailpasswordlogin");
                }}/>
            </div>
        </div>
    );
}
