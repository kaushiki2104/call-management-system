 
import {prisma} from '../../../config/db.js'
import asyncHandler from '../../../utility/asyncHandler.js'
// import bcrypt from 'bcryptjs'
import { hashPassword } from "../../../services/hashedPassword.js"
// export const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, phoneNumber } = req.body


//     if (req.user.role !== 'ADMIN') {
     
//     return  res.status(400).json({
//         success: false,
//         message:'Only admin can add users'
//       })
//     }

//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   })

//   if (existingUser) {
//   return  res.status(400).json({
//       success: false,
//       message: 'User already exists'
//     })
 
//   }

//   const hashedPassword = await bcrypt.hash(password, 10)
//  try {
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         phoneNumber,
//         password: hashedPassword,
//         role: 'USER',
//         organizationId: req.user.organizationId
//       }
//     })

//     return res.status(201).json({
//       success: true,
//       message: 'User created successfully'
//     })

//   } catch (error) {

//     if (error.code === 'P2002') {
//       const field = error.meta?.target?.[0]

//       if (field === 'phoneNumber') {
//         return res.status(400).json({
//           success: false,
//           message: 'Mobile number cannot be duplicate'
//         })
//       }

//       if (field === 'email') {
//         return res.status(400).json({
//           success: false,
//           message: 'Email already exists'
//         })
//       }
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Something went wrong'
//     })
//   }
 
// })

export const createUser =asyncHandler( async (req, res) => {
const { name, email, password, phoneNumber, role, supervisorId } = req.body
const creator = req.user

// determine supervisor
const finalSupervisorId = supervisorId || creator.id

const supervisor = await prisma.user.findUnique({
  where: { id: finalSupervisorId }
})

if (!supervisor) {
  return res.status(404).json({ message: "Supervisor not found" })
}

if (supervisor.organizationId !== creator.organizationId) {
  return res.status(403).json({ message: "Supervisor not in your organization" })
}

// role creation rules
const roleRules = {
  ADMIN: ["MANAGER", "LEADER", "USER"],
  MANAGER: ["LEADER", "USER"],
  LEADER: ["USER"]
}

if (!roleRules[creator.orgRole].includes(role)) {
  return res.status(403).json({ message: "You cannot create this role" })
}

// placement rules
if (creator.orgRole === "LEADER" && finalSupervisorId !== creator.id) {
  return res.status(403).json({
    message: "Leader can only create users under himself"
  })
}

if (creator.orgRole === "MANAGER" && supervisor.orgRole === "MANAGER" && finalSupervisorId !== creator.id) {
  return res.status(403).json({
    message: "Manager cannot assign users under another manager"
  })
}


 try {

    const hasPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hasPassword,
        phoneNumber,
        orgRole: role,
        organizationId: creator.organizationId,
        createdById: creator.id,
        supervisorId : finalSupervisorId
      }
    })

    res.status(201).json({
      message: "User created successfully",
      data: user
    })

  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]

      if (field === 'phoneNumber') {
        return res.status(400).json({
          success: false,
          message: 'Mobile number cannot be duplicate'
        })
      }

      if (field === 'email') {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        })
      }
    }
    res.status(500).json({ message: "Internal server error" })
  }
})

