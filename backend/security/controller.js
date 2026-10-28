import {
  createAccessToken,
  hashPassword,
  sanitizeUser,
  validateRegistrationInput,
  verifyPassword,
} from "./auth.js";

const plain = (value) => (typeof value.toObject === "function" ? value.toObject() : value);

export function createAuthController({ User, jwtSecret, tokenExpiresIn = "1h" }) {
  if (!User) {
    throw new Error("A User model is required.");
  }

  return {
    register: async (req, res, next) => {
      const validation = validateRegistrationInput(req.body);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      try {
        const { name, email, password, role } = validation.value;
        if (await User.findOne({ email }).lean()) {
          return res.status(409).json({ message: "An account with this email already exists." });
        }

        const user = plain(await User.create({
          name,
          email,
          role,
          passwordHash: await hashPassword(password),
        }));

        return res.status(201).json({
          user: sanitizeUser(user),
          token: createAccessToken(user, { secret: jwtSecret, expiresIn: tokenExpiresIn }),
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
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
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
