import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../src/models/user.model'

dotenv.config()

const walletAddress = '0x0e3f90102c4097afdd35a5ef33dfc5b421494945'

async function checkWallet() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')
    console.log('Connected to MongoDB\n')

    // Find all users with this wallet
    const users = await User.find({ walletAddress: walletAddress.toLowerCase() })
    
    if (users.length > 0) {
      console.log(`Found ${users.length} user(s) with this wallet:\n`)
      users.forEach(user => {
        console.log(`- Email: ${user.email}`)
        console.log(`  Name: ${user.name}`)
        console.log(`  Role: ${user.role}`)
        console.log(`  Verified: ${user.verified}`)
        console.log(`  Wallet: ${user.walletAddress}\n`)
      })
    } else {
      console.log('No users found with this wallet address')
    }

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkWallet()
