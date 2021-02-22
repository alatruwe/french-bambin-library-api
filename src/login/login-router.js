const express = require("express");
const LoginService = require("./login-service");

const loginRouter = express.Router();
const jsonBodyParser = express.json();

loginRouter.post("/", jsonBodyParser, (req, res, next) => {
  const { email, user_password } = req.body;
  const loginUser = { email, user_password };

  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });

  LoginService.getUserWithEmail(req.app.get("db"), loginUser.email)
    .then((dbUser) => {
      if (!dbUser)
        return res.status(400).json({
          error: "Incorrect email or password",
        });
      return LoginService.comparePasswords(
        loginUser.user_password,
        dbUser.user_password
      ).then((compareMatch) => {
        if (!compareMatch)
          return res.status(400).json({
            error: "Incorrect email or password",
          });

        const sub = dbUser.email;
        const payload = { user_id: dbUser.id };
        res.send({
          authToken: LoginService.createJwt(sub, payload),
        });
      });
    })
    .catch(next);
});

loginRouter.post("/refresh", requireAuth, (req, res) => {
  const sub = req.user.email;
  const payload = { user_id: req.user.id };
  res.send({
    authToken: AuthService.createJwt(sub, payload),
  });
});

module.exports = loginRouter;
