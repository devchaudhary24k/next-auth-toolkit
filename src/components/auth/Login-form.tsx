"use client";

import {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage, FormLabel} from "@/components/ui/form"
import * as z from "zod"
import {LoginSchema} from "@/schemas";
import CardWrapper from "@/components/auth/CardWrapper";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { login } from "@/actions/login";

export default function LoginForm() {

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    // Login Form Validator
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues:{
            email: "",
            password: ""
        }
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {

        setError("");
        setSuccess("");

        startTransition(() => {
            login(values)
                .then((data)=>{
                    setError(data.error);
                    setSuccess(data.success);
                })
        });
    }

    return(
        <CardWrapper
            headerLabel={"Welcome Back"}
            backButtonLabel={"Don't have an account"}
            backButtonHref={"/auth/register"}
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">


                    {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="dev@example.com" type='email' disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    {/*  Password  */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="******" type='password' disabled={isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button type='submit' className="w-full" >
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}


