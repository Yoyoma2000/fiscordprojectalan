'use client'
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/app/firebase/config";
import {useContext, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import SideBar from "@/app/components/SideBar";
import {Transition} from "@headlessui/react";
import {SidebarContext} from "@/app/lib/contexts";

export default function AuthLayout({children,}: Readonly<{ children: React.ReactNode;}>) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const {isOpen, setIsOpen} = useContext(SidebarContext);
    const [isWeb, setIsWeb] = useState(false);
    useEffect( () => {
        if (!user && !loading) {
            router.push("/login")
        }
    }, [loading, user])

    useEffect(() => {
        function useMediaQuery() {
            setIsWeb(window.matchMedia("(min-width:640px)").matches)
        }
        window.addEventListener("resize", useMediaQuery);
        return () => window.removeEventListener("resize", useMediaQuery);
    })

    return (!loading && user) && <main className={"flex h-full relative"}>
        <Transition show={isOpen || !isWeb} className={"z-10 w-full h-full sm:w-3/12 sm:min-w-60 sm:max-w-80 fixed sm:static transition duration-150 ease-in-out data-[closed]:-translate-x-full"} as="div">
            <SideBar/>
        </Transition>

        {children}
    </main>;
}