"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TrainFront } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { authClient, useSession } from "@/lib/auth-client";

export default function Login() {
  const {data} = useSession();
  
  const router = useRouter();
  if(data?.user){
    router.push('/')
    
  }

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleSignIn = async (e) => {

    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onRequest: () => {
          setLoading(true);
        },

        onSuccess: () => {
          setLoading(false);
          toast.success("Login successful");
          router.push("/");
        },

        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message);
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    setGLoading(true);

    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setGLoading(false);
          toast.success("Login successful");
          
        },

        onError: (ctx) => {
          setGLoading(false);
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center container-div flex-col mt-20 md:mt-10 justify-center px-4 bg-stone-50 dark:bg-neutral-950 transition-colors">
      {/* Logo */}
      <div className="mx-auto flex items-center mb-5 gap-2.5">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 dark:bg-orange-500 text-orange-50">
          <TrainFront />
        </span>

        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Ticket
          <span className="text-orange-600 dark:text-orange-500">
            Lagbe
          </span>
        </h2>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-stone-900 dark:text-stone-50">
          Login
        </h1>

        <form onSubmit={handleSignIn}>
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
          <div className="mb-6">
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                name="password"
                placeholder="Enter your password"
                className="w-full border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-500 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 rounded-xl font-semibold transition-colors disabled:opacity-70"
          >
            {loading ? <Spinner /> : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-neutral-800"></div>
          <span className="text-stone-400 dark:text-stone-500 text-sm">
            OR
          </span>
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-neutral-800"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={gLoading}
          className="w-full flex items-center justify-center gap-3 border border-stone-300 dark:border-neutral-700 rounded-xl py-3 h-14 bg-white dark:bg-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-70"
        >
          {gLoading ? (
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

        {/* Signup Link */}
        <p className="text-center text-stone-500 dark:text-stone-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}