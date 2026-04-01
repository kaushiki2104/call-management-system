import jwt from 'jsonwebtoken'

// const generateToken = (userId) => {
//   return jwt.sign(
//     { id: userId },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   )
// }
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  })
}

export default generateToken