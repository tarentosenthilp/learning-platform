export async function action() {
  throw new Response("User switching is disabled", { status: 403 });
}
