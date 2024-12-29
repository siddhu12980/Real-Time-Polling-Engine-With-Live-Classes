import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { userState } from "../store/userStore";
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { decodeToken } from "../utils";

const SignIn = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const setUser = useSetRecoilState(userState);
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    teacherCode: "",
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, password: "" }));
    }

    if (name === "password") {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isSignIn) {
      console.log("Signing in with:", formData.email, formData.password);

      const base_url = "http://localhost:8080";

      axios;
      axios
        .post(
          `${base_url}/auth/signin`,
          {
            email: formData.email,
            password: formData.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log(JSON.stringify(response.data));

          const token = response.data.data;

          const token_data = decodeToken(token);

          console.log("Token data:", token_data);

          if (token_data) {
            setUser((prev) => ({
              ...prev,
              token: token,
              userName: token_data.username,
              userId: token_data.userId,
              role: token_data.role,
            }));

            nav("/home");
          } else {
            toast.error("Invalid token");
          }
        })
        .catch((error) => {
          console.error(error.response);

          const message = error.response.data.error;

          if (error.response.status === 401) {
            toast.error("Invalid email or password");
          } else if (error.response.status === 404) {
            toast.error(message);
          } else {
            toast.error("An error occurred. Please try again later.");
          }
        });
    } else {
      if (formData.password !== formData.confirmPassword) {
        setErrors({
          ...errors,
          confirmPassword: "Passwords do not match",
        });
        return;
      }
      console.log("Signing up with:", formData);

      const base_url = "http://localhost:8080";

      axios
        .post(
          `${base_url}/auth/signup`,
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            code: formData.teacherCode,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log(JSON.stringify(response.data));
          toast.success("Account created successfully");

          const token = response.data.data;

          if (token) {
            setUser((prev) => ({
              ...prev,
              token: token,
            }));
          }

          console.log("User state:", token);

          //   nav("/home");
        })
        .catch((error) => {
          console.error(error.response);

          const message = error.response.data.error;

          if (error.response.status) {
            toast.error(message);
          } else {
            toast.error("An error occurred. Please try again later.");
          }
        });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with image */}
      <div className="hidden w-1/2 border-r border-gray-200 lg:block">
        <div className="flex h-full items-center justify-center p-8">
          <img
            src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
            className="w-full"
            alt="Sample image"
          />
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-6">
          <h2 className="text-center text-3xl font-bold">
            {isSignIn ? "Sign In" : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSignIn && (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {!isSignIn && (
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-left text-xs">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {!isSignIn && (
              <div>
                <input
                  type="text"
                  name="teacherCode"
                  value={formData.teacherCode}
                  onChange={handleChange}
                  placeholder="Teacher Code (optional)"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I accept the terms and conditions
              </label>
            </div>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 flex-shrink text-gray-600">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 focus:outline-none"
              >
                {isSignIn ? "Sign In" : "Sign Up"}
              </button>

              <button
                type="button"
                className="w-full rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 focus:outline-none"
              >
                Continue with Google
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isSignIn
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsSignIn(!isSignIn)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {isSignIn ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default SignIn;
