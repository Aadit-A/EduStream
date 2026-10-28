import {
  createAccessToken,
  hashPassword,
  sanitizeUser,
  validateRegistrationInput,
  verifyPassword,
} from "./auth.js";

function plainUser(user) {
  return typeof user.toObject === "function" ? user.toObject() : user;
}

export function createAuthController({ User, jwtSecret, tokenExpiresIn = "1h" }) {
  if (!User) {
    throw new Error("A User model is required.");
  }

  return {
    register: async (req, res, next) => {
      const validation = validateRegistrationInput(req.body ?? {});
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      try {
        const { name, email, password, role } = validation.value;
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
          return res.status(409).json({ message: "An account with this email already exists." });
        }

        const user = await User.create({
          name,
          email,
          role,
          passwordHash: await hashPassword(password),
        });
        const userValue = plainUser(user);

        return res.status(201).json({
          user: sanitizeUser(userValue),
          token: createAccessToken(userValue, { secret: jwtSecret, expiresIn: tokenExpiresIn }),
        });
      } catch (error) {
        if (error?.code === 11000) {
          return res.status(409).json({ message: "An account with this email already exists." });
        }
        return next(error);
      }
    },

    login: async (req, res, next) => {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const password = req.body?.password;

      if (!email || typeof password !== "string") {
        return res.status(400).json({ message: "Email and password are required." });
      }

      try {
        const user = await User.findOne({ email }).lean();
        const validPassword = user && await verifyPassword(password, user.passwordHash);
        if (!validPassword) {
          return res.status(401).json({ message: "Invalid email or password." });
        }

        return res.json({
          user: sanitizeUser(user),
          token: createAccessToken(user, { secret: jwtSecret, expiresIn: tokenExpiresIn }),
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}
