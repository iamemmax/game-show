"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/core/Input";
import { loginSchema, type LoginFormData } from "./schema";
import { Button, ErrorModal } from "@/components/core";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useLogin } from "../api/login";
import { SmallSpinner } from "@/icons/core";

const LoginPage = () => {
    const {
        isErrorModalOpen,
        setErrorModalState,
        // closeErrorModal,
        openErrorModalWithMessage,
        errorModalMessage,
      } = useErrorModalState();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login_code: "",
    },
    mode: "onChange",
  });


  
  const router = useRouter()

  const { mutate: handleLoginContestant, isLoading } = useLogin();
  const onSubmit = (data: LoginFormData) => {
    handleLoginContestant(data, {
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
    <div className=" flex h-screen items-center justify-center ">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-white/80 text-sm">Enter your contestant ID to continue</p>
        </div>
<div className="flex justify-center items-center flex-col w-full">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full h-[40vh] ">
          <div className="">
            <input
              {...register("login_code")}
              type="text"
              placeholder="Enter Contestant ID"
              className={`${errors.login_code ? "border-red-500 border-[2px]" : "border-none"} bg-white uppercase focus-visible:border-transparent h-[50px]  w-full placeholder:capitalize rounded-lg px-6  outline-none`}
              autoComplete="off"
              autoCapitalize="off"
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
              background: "linear-gradient(to right, #2D0304, #EE24B8,  #2D0304 )",
              border: "none"
            }}
          >
            Continue {isLoading && <SmallSpinner color="#fff"/>}
          </Button>
        </form>
</div>
      </div>

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
