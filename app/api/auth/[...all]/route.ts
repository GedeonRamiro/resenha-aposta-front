import { toNextJsHandler } from "better-auth/next-js";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected auth error";
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { auth } = await import("@/lib/auth");
    const handlers = toNextJsHandler(auth);
    return await handlers.GET(req);
  } catch (error) {
    return Response.json(
      {
        error: "auth_get_failed",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { auth } = await import("@/lib/auth");
    const handlers = toNextJsHandler(auth);
    return await handlers.POST(req);
  } catch (error) {
    return Response.json(
      {
        error: "auth_post_failed",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
