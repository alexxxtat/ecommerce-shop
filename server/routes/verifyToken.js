const JWT = require("jsonwebtoken");

//middleware need next
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    //after verify, return rither err or user data(something like auth login success user data)
    JWT.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        res
          .status(401)
          .json("Token is not valid, either expired or wrong token");
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("you are not authenticate");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    //is/:id on the url
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    //is/:id on the url
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
