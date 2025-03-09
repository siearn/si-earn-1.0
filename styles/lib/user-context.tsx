"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Mock user data
const mockUsers = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // In a real app, this would be hashed
    balance: 12.5,
    adsWatched: 10,
    watchTimeMinutes: 45,
    feedbackScore: 98,
    recentActivity: [
      {
        title: "New Smartphone Ad",
        date: "2023-05-15",
        amount: 1.25,
      },
      {
        title: "Travel Destination Survey",
        date: "2023-05-14",
        amount: 0.95,
      },
      {
        title: "Food Product Review",
        date: "2023-05-12",
        amount: 1.5,
      },
    ],
  },
]

// Create context
const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("siEarnUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // In a real app, this would be an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

        if (foundUser) {
          // Remove password from user object before storing
          const { password, ...userWithoutPassword } = foundUser
          setUser(userWithoutPassword)
          setIsAuthenticated(true)
          localStorage.setItem("siEarnUser", JSON.stringify(userWithoutPassword))
          resolve(userWithoutPassword)
        } else {
          reject(new Error("Invalid credentials"))
        }
      }, 500)
    })
  }

  const signup = async (name, email, password) => {
    // In a real app, this would be an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = mockUsers.find((u) => u.email === email)
        if (existingUser) {
          reject(new Error("User already exists"))
          return
        }

        // Create new user
        const newUser = {
          id: `user${mockUsers.length + 1}`,
          name,
          email,
          password, // In a real app, this would be hashed
          balance: 0,
          adsWatched: 0,
          watchTimeMinutes: 0,
          feedbackScore: 100,
          recentActivity: [],
        }

        mockUsers.push(newUser)

        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = newUser
        setUser(userWithoutPassword)
        setIsAuthenticated(true)
        localStorage.setItem("siEarnUser", JSON.stringify(userWithoutPassword))
        resolve(userWithoutPassword)
      }, 500)
    })
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("siEarnUser")
  }

  const updateUserBalance = (amount) => {
    if (user) {
      const updatedUser = {
        ...user,
        balance: user.balance + amount,
        adsWatched: user.adsWatched + 1,
      }
      setUser(updatedUser)
      localStorage.setItem("siEarnUser", JSON.stringify(updatedUser))

      // In a real app, this would also update the backend
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUserBalance,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

