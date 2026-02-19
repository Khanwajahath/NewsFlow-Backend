import User from "../models/Users.js"
import bcrypt from "bcryptjs"

const registerUser = async (req, res) => {
  try {
    const { username, age, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      age,
      email,
      password: hashedPassword,
    })

    res.status(201).json({ message: "User registered successfully" })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" })

    res.json({ message: "Login successful" })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
export {loginUser,registerUser}