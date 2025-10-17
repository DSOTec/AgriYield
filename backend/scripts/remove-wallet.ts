import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../src/models/user.model'

dotenv.config()

const walletAddress = '0x0e3f90102c4097afdd35a5ef33dfc5b421494945'

async function removeWallet() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')
    console.log('Connected to MongoDB')

    // Find user with this wallet
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    
    if (user) {
      console.log(`Found wallet connected to: ${user.email}`)
      console.log(`User: ${user.name} (${user.role})`)
      
      // Remove wallet
      user.walletAddress = undefined
      await user.save()
      
      console.log('✓ Wallet address removed successfully')
    } else {
      console.log('No user found with this wallet address')
    }

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

removeWallet()
