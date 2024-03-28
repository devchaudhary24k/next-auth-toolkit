"use client";

import {useRouter} from "next/navigation";
import {router} from "next/client";
interface LoginButtonProps{
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export default function Loginbtn({ children, mode="redirect", asChild }: LoginButtonProps){


    const router = useRouter()
    const onClick = () => {
        router.push("/auth/login");
    }

    if (mode === "modal") {
        return (
            <span>TODO: Implement Modal</span>
        )
    }


    return(
        <span className="cursor-pointer" onClick={onClick}>
            {children}
        </span>
    )
}