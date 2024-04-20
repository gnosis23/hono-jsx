import { Layout } from "../components/Layout";

export const LoginPage = ({ error }: { error?: string }) => {
  return (
    <Layout title={"Top"}>
      <main>
        {error ? <p style={{ color: "red" }}>{error}</p> : null}
        <form action="/login" method="post">
          <fieldset>
            <legend>Login Form</legend>
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="User Name"
            />
            <label for="password">Password</label>
            <input id="password" type="password" name="password" />
          </fieldset>
          <button type="submit">login</button>
        </form>
      </main>
    </Layout>
  );
};
