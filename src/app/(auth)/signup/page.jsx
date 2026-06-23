"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Ticket, User, Store, TrainFront } from "lucide-react";
import { toast } from "sonner";
// import { authClient } from "@/lib/auth-client";

import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { authClient, signUp } from "@/lib/auth-client";

export default function SignUp() {
const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorPass, setErrorPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [role, setRole] = useState("user"); // "user" | "vendor"


  // validate password
  const validatePassword = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasLength = password.length >= 6;

    return hasUpper && hasLower && hasNumber && hasLength;
  };

  // Google Login
  // Note: social sign-up has no form step, so the selected role here is what
  // gets sent. BetterAuth's social provider needs a `role` field accepted in
  // its user schema (see note below the component) for this to persist.
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
   const {data,error}=  await authClient.signIn.social({
      provider: "google",
      role,
    },{
      
        onSuccess: (e) => {
          router.push("/");
          
          console.log(e)

           
        },

        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message);
          console.log(ctx)
        },

        onResponse: () => {
          setLoading(true);
        },
      
    });
    createUser(e.data.user)
  };

  const createUser = async (data) => {
    
   
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/account`,{
      method:'POST',
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(data)
    })
    console.log('data->',res)
  
    
  }

  // Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const Fdata = Object.fromEntries(formData.entries());

    if (!validatePassword(Fdata.password)) {
      setErrorPass(
        "Password must include uppercase, lowercase, number, and be 6+ characters"
      );
      return;
    }

    if (Fdata.password !== Fdata.confirmpassword) {
      setErrorPass("Passwords must be the same");
      return;
    }

    const { email, password, name} = Fdata;

    setErrorPass("");

    const {data,error} =  await signUp.email(
      {
        email,
        password,
        name,
        
        role, // "user" or "vendor" — picked via the toggle below
        callbackURL: "/",
        rememberMe: true,
      },
      {
        onSuccess: (e) => {
          router.push("/");
          createUser(e.data.user)
          console.log(e)

           
        },

        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message);
          console.log(ctx)
        },

        onResponse: () => {
          setLoading(true);
        },
      }
    );
    

   
  };

  return (
    <div className="min-h-screen  mt-20 md:mt-30 mb-20 container-div flex-col flex items-center justify-center px-4 transition-colors">
      {/* Logo */}
      <div className="mx-auto flex items-center mb-5 gap-2.5">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 dark:bg-orange-500 text-orange-50">
          <TrainFront />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Ticket<span className="text-orange-600 dark:text-orange-500">Lagbe</span>
        </h2>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-stone-900 dark:text-stone-50">
          Sign Up
        </h1>

        {/* Role selector */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-sm text-stone-700 dark:text-stone-300">
            I want to sign up as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <RoleOption
              icon={User}
              label="User"
              sublabel="Book tickets"
              selected={role === "user"}
              onClick={() => setRole("user")}
            />
            <RoleOption
              icon={Store}
              label="Vendor"
              sublabel="Sell tickets"
              selected={role === "vendor"}
              onClick={() => setRole("vendor")}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp}>
          {/* Name */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Name
            </label>

            <input
              type="text"
              required
              name="name"
              placeholder="Enter your name"
              className="w-full border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Email
            </label>

            <input
              type="email"
              required
              name="email"
              placeholder="Enter your email"
              className="w-full border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

         
          

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Password
            </label>

            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                name="password"
                className="w-full border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmpassword"
                required
                className="w-full border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {errorPass.length !== 0 && (
            <div className="mt-3 mb-3 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 rounded-xl">
              <p className="font-semibold text-red-600 dark:text-red-400 text-sm">
                {errorPass}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 h-11 text-orange-50 rounded-xl font-semibold transition-colors"
          >
            {loading ? <Spinner /> : `Sign Up as ${role === "user" ? "User" : "Vendor"}`}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-neutral-800"></div>
          <span className="text-stone-400 dark:text-stone-500 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-neutral-800"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 h-14 rounded-xl py-3 hover:bg-stone-50 dark:hover:bg-neutral-700 transition-colors"
        >
          {googleLoading ? (
            <Spinner />
          ) : (
            <>
              <FcGoogle size={24} />
              <span className="font-medium text-stone-900 dark:text-stone-50">
                Continue with Google
              </span>
            </>
          )}
        </button>

        <p className="text-center text-stone-500 dark:text-stone-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleOption({ icon: Icon, label, sublabel, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3.5 transition-colors",
        selected
          ? "border-orange-600 dark:border-orange-500 bg-orange-50 dark:bg-orange-500/10"
          : "border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-stone-300 dark:hover:border-neutral-600",
      ].join(" ")}
    >
      <Icon
        size={20}
        className={
          selected
            ? "text-orange-600 dark:text-orange-400"
            : "text-stone-400 dark:text-stone-500"
        }
      />
      <span
        className={[
          "text-sm font-semibold",
          selected
            ? "text-orange-600 dark:text-orange-400"
            : "text-stone-700 dark:text-stone-300",
        ].join(" ")}
      >
        {label}
      </span>
      <span className="text-[11px] text-stone-400 dark:text-stone-500">{sublabel}</span>
    </button>
  );
}