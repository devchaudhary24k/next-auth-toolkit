"use client";

import CardWrapper from "@/components/auth/CardWrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/newVerification";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";

export default function NewVerificationForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const searchParams = useSearchParams();
  // Searches the URL for any parameter named with token.
  const token = searchParams.get("token");

  // onsubmit function defined
  const onSubmit = useCallback(() => {
    // Returns the function if any success or error message is already present in the state, if by any chance function
    // starts again it will simply return in the start.
    if (success || error) return;

    // if error token is not present in the url, sets an error message and immediately returns the function.
    if (!token) {
      setError("Missing Token!");
      return;
    }

    // Calls the new verification server action with token from URL passed to the function and returns error from the
    // server action and renders them on the page.
    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      // If the whole process breaks by any chance, this catches it.
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, success, error]);

  // used to run onSubmit callBack, only runs when onsubmit is triggered.
  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {/* Only renders loader when both error message and success message os not returned. */}
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />

        {/* Only renders the error message if success message is not returned. */}
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
}
