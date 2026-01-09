import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { todos, TodosSelectType } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import {
  EditIcon,
  ListTodoIcon,
  LogOutIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { startTransition, useState } from "react";
import { toast } from "sonner";
import z from "zod";

// this is a server function which runs on the server
const serverFn = createServerFn({ method: "GET" }).handler(() => {
  return db.query.todos.findMany();
});
export const Route = createFileRoute("/_protected/todos/")({
  component: App,

  // the loader runs in both the server and client side , so if we fetch datat directly here this would run both in the server and the client.
  loader: () => {
    return serverFn();
  },
});

function App() {
  // accessing the loader data
  const todos = Route.useLoaderData();
  const completeCount = todos.filter((t) => t.isComplete).length;
  const totalCount = todos.length;
  const [isLogginOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully.");
            router.navigate({ to: "/" });
          },
          onError: ({ error }) => {
            toast.error(error.message);
          },
        },
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <div className="min-h-screen container space-y-8">
      <div className="flex justify-between items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Todo List</h1>
          {totalCount > 0 && (
            <Badge variant="outline">
              {completeCount} of {totalCount} completed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" asChild>
            <Link to="/todos/new">
              <PlusIcon /> Add Todo
            </Link>
          </Button>
          <Button
            onClick={handleLogout}
            disabled={isLogginOut}
            size="sm"
            variant="destructiveGhost"
          >
            {isLogginOut ? (
              <Spinner />
            ) : (
              <>
                {" "}
                <LogOutIcon /> Logout
              </>
            )}
          </Button>
        </div>
      </div>

      <TodoListTable todos={todos} />
    </div>
  );
}

function TodoListTable({ todos }: { todos: TodosSelectType[] }) {
  if (todos.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListTodoIcon />
          </EmptyMedia>
          <EmptyTitle>No todos</EmptyTitle>
          <EmptyDescription>Try adding a new todo</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/todos/new">
              <PlusIcon /> Add Todo
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }
  return (
    <Table>
      <TableRow className="hover:bg-transparent">
        <TableHead></TableHead>
        <TableHead>Task</TableHead>
        <TableHead>Created On</TableHead>
        <TableHead className="w-0"></TableHead>
      </TableRow>
      <TableBody>
        {todos.map((todo) => (
          <TodoTableRow key={todo.id} todo={todo} />
        ))}
      </TableBody>
    </Table>
  );
}

const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    await db.delete(todos).where(eq(todos.id, data.id));

    return { success: true };
  });
const toggleTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1), isComplete: z.boolean() }))
  .handler(async ({ data }) => {
    await db
      .update(todos)
      .set({ isComplete: data.isComplete })
      .where(eq(todos.id, data.id));
  });

function TodoTableRow({ todo }: { todo: TodosSelectType }) {
  const deleteTodoFn = useServerFn(deleteTodo);
  const toggleTodoFn = useServerFn(toggleTodo);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isCurrentComplete, setIsCurrentComplete] = useState<boolean>(
    todo.isComplete
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTodoFn({ data: { id: todo.id } });
    if (result.success) {
      router.invalidate();
    }
    setIsDeleting(false);
  };
  return (
    <TableRow
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-actions]")) return;

        setIsCurrentComplete((prev) => !prev);
        startTransition(async () => {
          await toggleTodoFn({
            data: { isComplete: !isCurrentComplete, id: todo.id },
          });
          router.invalidate();
        });
      }}
    >
      <TableCell>
        <Checkbox checked={isCurrentComplete} />
      </TableCell>
      <TableCell
        className={cn(
          "font-medium",
          isCurrentComplete && "text-muted-foreground line-through"
        )}
      >
        {todo.name}
      </TableCell>
      <TableCell className={cn("text-muted-foreground ")}>
        {formatDate(todo.createdAt)}
      </TableCell>
      <TableCell data-actions>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/todos/$id/edit" params={{ id: todo.id }}>
              <EditIcon />
            </Link>
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructiveGhost"
            size="sm"
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner /> : <TrashIcon />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });
  return formatter.format(date);
}
