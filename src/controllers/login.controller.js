
import {prisma} from '../config/db.js'
import asyncHandler from '../utility/asyncHandler.js'
import generateToken from '../utility/generateToken.js'
import { comparePassword } from '../services/hashedPassword.js'


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }

  const isMatch = await comparePassword(password, user.password)
   

  if (!isMatch) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }

  res.json({
    success: true,
    orgRole: user.orgRole,
     token: generateToken({
    id: user.id,
    orgRole: user.orgRole,
    organizationId: user.organizationId
  })
  })
})


export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  console.log("login person is: - ", user)
  if (!user) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }

  const isMatch = await comparePassword(password, user.password)

  if (!isMatch) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }
  
  res.json({
    success: true,
    orgRole: user.orgRole,
    userId: user?.id,
     token: generateToken({
    id: user.id,
    orgRole: user.orgRole,
    organizationId: user.organizationId
  })
  })
})


export const loginSuperAdmin = asyncHandler(async(req,res)=>{
  const {email, password} = req.body;
   const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }

  const isMatch = await comparePassword(password, user.password)

  if (!isMatch) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }


  res.json({
    success: true,
    orgRole: user.orgRole,
     token: generateToken({
    id: user.id,
    orgRole: user.platformRole,
    // organizationId: user.organizationId
  })
  })

})
