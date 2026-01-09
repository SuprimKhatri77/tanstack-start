import { auth } from "@/lib/auth";
import { registerInputSchema } from "@/validations/auth/auth.input";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";

export const register = createServerFn({ method: "POST" })
  .inputValidator(registerInputSchema)
  .handler(async ({ data }) => {
    try {
      console.log("request headers: ", getRequestHeaders());

      const name = data.email.split("@")[0];
      console.log("name: ", name);
      const { headers: responseHeaders } = await auth.api.signUpEmail({
        body: {
          ...data,
          name,
        },
        headers: getRequestHeaders(),
        returnHeaders: true,
      });
      console.log("headers: ", responseHeaders);

      return { success: true, message: "Registration successful." };
    } catch (error) {
      console.log("error: ", error);
      if (error instanceof APIError) {
        console.log("api error message: ", error.message);
        return { success: false, message: error.message };
      }

      return { success: false, message: "Failed to register!" };
    }
  });
