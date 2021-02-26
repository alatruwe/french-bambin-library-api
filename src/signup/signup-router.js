const express = require("express");
const SignupService = require("./signup-service");

const signupRouter = express.Router();
const jsonBodyParser = express.json();

signupRouter.post("/", jsonBodyParser, (req, res, next) => {
  const { user_password, email, first_name, last_name } = req.body;

  for (const field of ["first_name", "last_name", "email", "user_password"])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  const passwordError = SignupService.validatePassword(user_password);

  if (passwordError) return res.status(400).json({ error: passwordError });

  SignupService.hasUserWithEmail(req.app.get("db"), email)
    .then((hasUserWithEmail) => {
      if (hasUserWithEmail)
        return res.status(400).json({ error: `Email already taken` });

      return SignupService.hashPassword(user_password).then(
        (hashedPassword) => {
          const newUser = {
            first_name,
            last_name,
            email,
            user_password: hashedPassword,
          };

          return SignupService.insertUser(req.app.get("db"), newUser).then(
            (user) => {
              const sub = user.email;
              const payload = { user_id: user.id };
              res.status(201).json({
                id: user.id,
                first_name,
                last_name,
                email,
                authToken: SignupService.createJwt(sub, payload),
              });
            }
          );
        }
      );
    })
    .catch(next);
});

module.exports = signupRouter;
