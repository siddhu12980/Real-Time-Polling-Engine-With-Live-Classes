
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userState } from "../store/userStore";

interface FormData {
  username: string;
  password: string;
}
const Join = () => {


  const navigate = useNavigate()


  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: ""

  });

  const [user, setUser] = useRecoilState(userState)


  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = (): Partial<FormData> => {
    const errors: Partial<FormData> = {};
    if (!formData.username) errors.username = "Username is required";
    if (!formData.password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {

      console.log("Form submitted successfully", formData);

      setUser({
        ...user,
        userName: formData.username,
        isteacher: formData.username.toLowerCase() === "admin",
      });



      navigate("/home")

      setFormData({
        username: "",
        password: "",
      });
      setErrors({});
    }
  };

  return (
    <>
      <div className="flex flex-row w-full h-full items-center justify-center ">
        <div className="w-1/2 bg-gray-150 flex items-center justify-center">
          <div className="sm:max-w-md w-full">
            <h1 className="text-center text-2xl font-bold leading-tight tracking-wider text-gray-900 md:text-4xl">
              Create an account
              <p className="text-sm py-2 font-normal tracking-tight">
                Already have an account?{" "}
                <span className="font-bold">
                  {" "}
                  <Link to={"#"}>Login</Link>{" "}
                </span>
              </p>
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-bold text-gray-900"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="username"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
              </div>



              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-bold text-gray-900"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Signup
              </button>
            </form>
          </div>
        </div>

        <div className="w-1/2 bg-gray-200 h-screen flex justify-center items-center">
          <div className="sm:max-w-lg w-full">
            <div className="font-bold text-2xl">
              "The customer service is amazing. I can't wait to buy more. The
              support team went above and beyond to help me. I am very happy
              with the results. I will definitely recommend this to my friends."
            </div>
            <div className="pt-5 font-medium text-xl">Mr Xyz</div>
            <div className="text-sm opacity-35">CEO, XYZ company</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Join;
