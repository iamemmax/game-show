// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { loginSchema, type LoginFormData } from "./schema";
// import { Button, ErrorModal } from "@/components/core";
// import { useErrorModalState } from "@/hooks";
// import { formatAxiosErrorMessage } from "@/utils";
// import { AxiosError } from "axios";
// import { useRouter } from "next/navigation";
// import { useLogin } from "../api/login";
// import { SmallSpinner } from "@/icons/core";
// import { useEffect } from "react";

// const LoginPage = () => {
//   const {
//     isErrorModalOpen,
//     setErrorModalState,
//     openErrorModalWithMessage,
//     errorModalMessage,
//   } = useErrorModalState();
  
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       login_code: "",
//     },
//     mode: "onChange",
//   });

//   const router = useRouter();
//   const { mutate: handleLoginContestant, isLoading } = useLogin();
  
//   // Watch the login_code field to transform it
//   const loginCode = watch("login_code");
  
//   // Effect to transform input to uppercase and remove spaces
//   useEffect(() => {
//     if (loginCode) {
//       const transformedValue = loginCode.replace(/\s+/g, "").toUpperCase();
//       if (transformedValue !== loginCode) {
//         setValue("login_code", transformedValue, { shouldValidate: true });
//       }
//     }
//   }, [loginCode, setValue]);

//   const onSubmit = (data: LoginFormData) => {
//     // Final transformation before submission
//     const transformedData = {
//       login_code: data.login_code.replace(/\s+/g, "").toUpperCase()
//     };
    
//     handleLoginContestant(transformedData, {
//       onSuccess: ({ status }) => {
//         if (status) {
//           router.push(`/`);
//         }
//       },
//       onError: (error) => {
//         const errorMessage = formatAxiosErrorMessage(error as AxiosError);
//         openErrorModalWithMessage(String(errorMessage));
//       },
//     });
//   };

//   return (
//     <div className="flex h-screen items-center justify-center">
//       <div className="w-full max-w-md p-6 space-y-6">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
//           <p className="text-white/80 text-sm">Enter your contestant ID to continue</p>
//         </div>
//         <div className="flex justify-center items-center flex-col w-full">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full h-[40vh]">
//             <div className="">
//               <input
//                 {...register("login_code")}
//                 type="text"
//                 placeholder="Enter Contestant ID"
//                 className={`${errors.login_code ? "border-red-500 border-[2px]" : "border-none"} bg-white uppercase focus-visible:border-transparent h-[50px] w-full placeholder:capitalize rounded-lg px-6 outline-none`}
//                 autoComplete="off"
//                 autoCapitalize="characters"
//                 onChange={(e) => {
//                   // Transform input on change
//                   const value = e.target.value.replace(/\s+/g, "").toUpperCase();
//                   e.target.value = value;
//                   setValue("login_code", value, { shouldValidate: true });
//                 }}
//               />
//               {errors.login_code && (
//                 <p className="mt-1 text-xs text-red-500">
//                   {errors.login_code.message}
//                 </p>
//               )}
//             </div>
            
//             <Button
//               type="submit"
//               className="w-full text-white py-4 px-4 flex items-center justify-center gap-x-3 rounded-md transition duration-200"
//               style={{
//                 background: "linear-gradient(to right, #2D0304, #EE24B8, #2D0304)",
//                 border: "none"
//               }}
//             >
//               Continue {isLoading && <SmallSpinner color="#fff"/>}
//             </Button>
//           </form>
//         </div>
//       </div>

//       <ErrorModal
//         isErrorModalOpen={isErrorModalOpen}
//         setErrorModalState={() => {
//           setErrorModalState(false);
//         }}
//         subheading={
//           errorModalMessage ||
//           "Please check your inputs and try again."
//         }
//       ></ErrorModal>
//     </div>
//   );
// };

// export default LoginPage;












"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "./schema";
import { Button, ErrorModal } from "@/components/core";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { useLogin } from "../api/login";
import { SmallSpinner } from "@/icons/core";
import { useEffect, useState } from "react";
import Logo from "@/app/icons/Logo";
import ClearIcon from "@/app/icons/ClearIcon";

const LoginPage = () => {
  const params = useSearchParams()
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  
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
      game_episode:""
    },
    mode: "onChange",
  });

  useEffect(() => {
   setValue("game_episode", String(params.get("episode"))) 
  
  }, [params])

  const router = useRouter();
  const { mutate: handleLoginContestant, isLoading } = useLogin();
console.log(params);

  // Update form value when code changes
  useEffect(() => {
    const codeString = code.join("");
    setValue("login_code", codeString, { shouldValidate: true });
 
    
    // Auto-submit when code is complete
    if (codeString.length === 4) {
      // Call onSubmit directly with the form data
      onSubmit({ login_code: codeString,game_episode: String(params.get("episode")) });
    }
  }, [code, setValue]);

  const handleNumberClick = (num: string) => {
    // Clear error state when user starts typing again
    if (hasError) {
      setHasError(false);
    }
    
    const emptyIndex = code.findIndex(digit => digit === "");
    if (emptyIndex !== -1) {
      const newCode = [...code];
      newCode[emptyIndex] = num;
      setCode(newCode);
    }
  };

  const handleDelete = () => {
    // Clear error state when user modifies code
    if (hasError) {
      setHasError(false);
    }
    
    const lastFilledIndex = code.map((digit, index) => digit !== "" ? index : -1)
      .filter(index => index !== -1)
      .pop();
    
    if (lastFilledIndex !== undefined) {
      const newCode = [...code];
      newCode[lastFilledIndex] = "";
      setCode(newCode);
    }
  };

  const handleCodeBoxClick = (index: number) => {
    // Clear error state when user clicks on code box
    if (hasError) {
      setHasError(false);
    }
    
    // Clear all digits after the clicked index
    const newCode = [...code];
    for (let i = index; i < newCode.length; i++) {
      newCode[i] = "";
    }
    setCode(newCode);
  };

  const onSubmit = (data: LoginFormData) => {
    const codeString = code.join("");
    if (codeString.length !== 4) {
      setHasError(true);
      openErrorModalWithMessage("Please enter a complete 4-digit code");
      return;
    }

    const transformedData = {
      login_code: codeString.toUpperCase(),
      game_episode:data?.game_episode
    };
    
    handleLoginContestant(transformedData, {
      onSuccess: ({ status }) => {
        if (status) {
          router.push(`/`);
        }
      },
      onError: (error) => {
        setHasError(true);
        const errorMessage = formatAxiosErrorMessage(error as AxiosError);
        openErrorModalWithMessage(String(errorMessage));
      },
    });
  };

  const isFormComplete = code.every(digit => digit !== "");

  return (
    <div 
      className="flex h-[100vh] items-center justify-center relative"
      style={{
        background: "linear-gradient(135deg, #1a0b2e 0%, #2d1b3d 50%, #1a0b2e 100%)",
      }}
    >
      {/* Background pattern/texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
        }}
      />
      
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <Logo/>
      </div>

      <div className="w-full max-w-md p-6 space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-1">Welcome Hustler</h1>
          <p className="text-white/70 text-base">Enter code below to login and get winning</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Hidden input for form validation */}
          <input
            {...register("login_code")}
            type="hidden"
            value={code.join("")}
          />

          {/* Code input boxes */}
         <div className="px-12">
           <div className="flex justify-center space-x-4 bg-[#1E0F38] px-[1.5625rem] py-[1.125rem] rounded-[2.5rem]">
            {code.map((digit, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCodeBoxClick(index)}
                className={`w-[3rem] h-[3rem] border p-[5.49px] rounded-[.875rem] bg-purple-900/30 backdrop-blur-sm 
                         flex items-center justify-center text-2xl font-bold text-white
                         hover:border-purple-400 transition-all duration-200
                         focus:outline-none focus:border-purple-300 ${
                           hasError 
                             ? 'border-red-500 hover:border-red-400 focus:border-red-400' 
                             : 'border-[#964FFF]'
                         }`}
              >
                {digit}
              </button>
            ))}
          </div>
         </div>

          {/* Show error message below code inputs */}
          {hasError && (
            <p className="text-center text-sm text-red-400">
              {errors.login_code?.message || "Invalid code entered"}
            </p>
          )}

          {/* Number keypad */}
          <div className=" flex justify-center items-center">
            <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num.toString())}
                disabled={isLoading}
                className="w-14 h-14 rounded-full bg-white text-black text-xl font-semibold
                         hover:bg-gray-100 transition-all duration-200 transform hover:scale-105
                         active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:transform-none"
              >
                {num}
              </button>
            ))}
            
            {/* Bottom row: 0 and delete */}
            <div className="col-start-2">
              <button
                type="button"
                onClick={() => handleNumberClick("0")}
                disabled={isLoading}
                className="w-14 h-14 rounded-full bg-white text-black text-xl font-semibold
                         hover:bg-gray-100 transition-all duration-200 transform hover:scale-105
                         active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:transform-none"
              >
                0
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClearIcon/>
            </button>
          </div>
          </div>

          {/* Loading indicator when submitting */}
          {isLoading && (
            <div className="flex justify-center">
              <SmallSpinner color="blue" />
            </div>
          )}
        </form>
      </div>

      <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => {
          setErrorModalState(false);
          setHasError(false); // Clear error state when modal is closed
        }}
        subheading={
          errorModalMessage ||
          "Please check your inputs and try again."
        }
      />
    </div>
  );
};

export default LoginPage;