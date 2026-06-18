"use client";

import { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Ticket, TrainFront } from "lucide-react";
import { toast } from "sonner";
// import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth-client";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const Fdata = Object.fromEntries(formData.entries());

    if (Fdata.password.length < 6) {
      toast.error("Password Must be 6 Character");
    } else {
      const { email, password } = Fdata;
      const { data, error } = await signIn.email(
        {
          email,
          password,
          callbackURL: "/",
        },
        {
          onRequest: (ctx) => {
            setLoading(true);
          },
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error.message);
          },
          onSuccess: (ctx) => {
            toast.success("Logging Successful");
          },
        }
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setGLoading(true);
    // const { data, error } = await authClient.signIn.social({
    //   provider: "google",
    //   callbackURL: "/",
    // });
    console.log(data, error);
    toast.success("Logging Successful");
  };

  return (
    <div className="min-h-screen flex items-center container-div flex-col mt-20 md:mt-10 justify-center px-4 bg-stone-50 dark:bg-neutral-950 transition-colors">
      {/* Logo */}
      <div className="mx-auto flex items-center mb-5 gap-2.5">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 dark:bg-orange-500 text-orange-50">
          <TrainFront />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Ticket<span className="text-orange-600 dark:text-orange-500">Lagbe</span>
        </h2>
      </div>

      {/* Main card container holding both the form and outside components */}
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
                name="password"
                required
                placeholder="Enter your password"
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 rounded-xl font-semibold transition-colors"
          >
            {loading ? <Spinner /> : "Login"}
          </button>
        </form>

        {/* ELEMENTS BELOW ARE NOW OUTSIDE THE FORM TAG */}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-neutral-800"></div>
          <span className="text-stone-400 dark:text-stone-500 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-stone-200 dark:bg-neutral-800"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-stone-300 dark:border-neutral-700 rounded-xl py-3 h-14 bg-white dark:bg-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-700 transition-colors"
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