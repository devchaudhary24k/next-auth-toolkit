"use client";

import React from "react";
import {Card, CardContent, CardHeader, CardFooter} from "@/components/ui/card";
import Header from "@/components/auth/Header";
import Social from "@/components/auth/Social";
import BackBtn from "@/components/auth/Back-btn";

interface CardWrapperProps{
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
}

export default function CardWrapper({children, headerLabel, backButtonLabel, backButtonHref, showSocial}: CardWrapperProps){
    return(
        <Card className="w-[400px] shadow-md">
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>

            <CardContent>{children}</CardContent>

            {showSocial && (
                <CardFooter>
                    <Social />
                </CardFooter>
            )}

            <CardFooter>
                <BackBtn
                    href={backButtonHref}
                    label={backButtonLabel}
                />
            </CardFooter>
        </Card>
    )
}