import jwt from "jsonwebtoken";

// Verificacion del token
function VerificacionToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No se proporcionó un token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    req.user = user;
    next();
  });
}

export default VerificacionToken;