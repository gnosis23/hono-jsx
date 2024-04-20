import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { sign, verify } from "hono/jwt";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Page } from "./pages/page";
import { Top } from "./pages/top";
import { LoginPage } from "./pages/login";

const TOKEN_NAME = "token";
const SECRET_KEY = process.env.SECRET_KEY as string;

const app = new Hono();

// Model
export type Post = {
  id: string;
  title: string;
  body: string;
};

const posts: Post[] = [
  { id: "1", title: "Good Morning", body: "Let us eat breakfast" },
  { id: "2", title: "Good Afternoon", body: "Let us eat Lunch" },
  { id: "3", title: "Good Evening", body: "Let us eat Dinner" },
  { id: "4", title: "Good Night", body: "Let us drink Beer" },
  { id: "5", title: "こんにちは", body: "昼からビールを飲みます" },
];

// Logic
const getPosts = () => posts;

const getPost = (id: string) => {
  return posts.find((post) => post.id == id);
};

// Middleware
function auth(): MiddlewareHandler {
  return async (c, next) => {
    // check login
    const token = getCookie(c, TOKEN_NAME);
    try {
      const payload = token ? await verify(token, SECRET_KEY) : null;
      if (!payload) {
        return c.redirect("/login");
      }
    } catch (err) {
      // invalid token
      deleteCookie(c, TOKEN_NAME);
      return c.redirect("/login");
    }

    await next();
  };
}

app.use("/post/*", auth());

// Controller
app.get("/", (c) => {
  const posts = getPosts();
  return c.html(<Top posts={posts} />);
});

app.get("/post/:id{[0-9]+}", async (c) => {
  const id = c.req.param("id");
  const post = getPost(id);
  if (!post) return c.notFound();
  return c.html(<Page post={post} />);
});

// Public visit
app.get("/login", (c) => {
  return c.html(<LoginPage />);
});

app.post("/login", async (c) => {
  const body = await c.req.parseBody();

  if (
    body.username === process.env.USERNAME &&
    body.password === process.env.PASSWORD
  ) {
    // login success
    const payload = {
      username: body.username,
      role: "admin",
    };
    const token = await sign(payload, SECRET_KEY);
    setCookie(c, TOKEN_NAME, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 600000 * 1000),
    });
    return c.redirect("/");
  }

  return c.html(<LoginPage error="invalid username/password" />);
});

export default app;
