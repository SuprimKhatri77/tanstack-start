import { FormEvent, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import z from "zod";
import { db } from "@/db";
import { todos, TodosSelectType } from "@/db/schema";
import { redirect } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";

// this is similar to what we do in nextjs by using server action and use server directive
const addTodo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ name: z.string().nonempty({ error: "Name is required." }) })
  )
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) throw redirect({ to: "/" });
    await db
      .insert(todos)
      .values({ ...data, isComplete: false, userId: session.user.id });
    throw redirect({ to: "/todos" });
  });

const updateTodo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().nonempty({ error: "Name is required." }),
      id: z.string(),
    })
  )
  .handler(async ({ data }) => {
    await db
      .update(todos)
      .set({ name: data.name })
      .where(eq(todos.id, data.id));
    throw redirect({ to: "/todos" });
  });
export function TodoForm({ todo }: { todo?: TodosSelectType }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //   to use the serverfn we must use the setup below
  const addTodoFn = useServerFn(addTodo);
  const updateTodoFn = useServerFn(updateTodo);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value;
    if (!name) return;
    setIsLoading(true);
    if (!todo) {
      await addTodoFn({ data: { name } });
    } else {
      await updateTodoFn({ data: { name, id: todo.id } });
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        autoFocus
        ref={nameRef}
        placeholder="Enter your todo..."
        className="flex-1"
        aria-label="Name"
        defaultValue={todo?.name}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Spinner />
        ) : !todo ? (
          <>
            <PlusIcon /> Add
          </>
        ) : (
          "Update"
        )}
      </Button>
    </form>
  );
}
