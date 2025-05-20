"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "./schema";
import { Button, ErrorModal } from "@/components/core";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useLogin } from "../api/login";
import { SmallSpinner } from "@/icons/core";
import { useEffect } from "react";
import PickCardContainer from "@/app/shared/PickCardContainer";

const LoginPage = () => {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login_code: "",
    },
    mode: "onChange",
  });

  const router = useRouter();
  const { mutate: handleLoginContestant, isLoading } = useLogin();
  
  // Watch the login_code field to transform it
  const loginCode = watch("login_code");
  
  // Effect to transform input to uppercase and remove spaces
  useEffect(() => {
    if (loginCode) {
      const transformedValue = loginCode.replace(/\s+/g, "").toUpperCase();
      if (transformedValue !== loginCode) {
        setValue("login_code", transformedValue, { shouldValidate: true });
      }
    }
  }, [loginCode, setValue]);

  const onSubmit = (data: LoginFormData) => {
    // Final transformation before submission
    const transformedData = {
      login_code: data.login_code.replace(/\s+/g, "").toUpperCase()
    };
    
    handleLoginContestant(transformedData, {
      onSuccess: ({ status }) => {
        if (status) {
          router.push(`/`);
        }
      },
      onError: (error) => {
        const errorMessage = formatAxiosErrorMessage(error as AxiosError);
        openErrorModalWithMessage(String(errorMessage));
      },
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-white/80 text-sm">Enter your contestant ID to continue</p>
        </div>
        <div className="flex justify-center items-center flex-col w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full h-[40vh]">
            <div className="">
              <input
                {...register("login_code")}
                type="text"
                placeholder="Enter Contestant ID"
                className={`${errors.login_code ? "border-red-500 border-[2px]" : "border-none"} bg-white uppercase focus-visible:border-transparent h-[50px] w-full placeholder:capitalize rounded-lg px-6 outline-none`}
                autoComplete="off"
                autoCapitalize="characters"
                onChange={(e) => {
                  // Transform input on change
                  const value = e.target.value.replace(/\s+/g, "").toUpperCase();
                  e.target.value = value;
                  setValue("login_code", value, { shouldValidate: true });
                }}
              />
              {errors.login_code && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.login_code.message}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full text-white py-4 px-4 flex items-center justify-center gap-x-3 rounded-md transition duration-200"
              style={{
                background: "linear-gradient(to right, #2D0304, #EE24B8, #2D0304)",
                border: "none"
              }}
            >
              Continue {isLoading && <SmallSpinner color="#fff"/>}
            </Button>
          </form>
        </div>
      </div>
      <PickCardContainer />

      <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => {
          setErrorModalState(false);
        }}
        subheading={
          errorModalMessage ||
          "Please check your inputs and try again."
        }
      ></ErrorModal>
    </div>
  );
};

export default LoginPage;
