#!/usr/bin/env ts-node

/**
 * Admin Account Creation Utility
 * 
 * This script creates an admin account for the learner assessment application.
 * It sets up the necessary environment variables and provides instructions for
 * configuring admin access.
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface AdminConfig {
  email: string
  name: string
  firebaseConfig: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  resendApiKey: string
}

function promptForInput(question: string): string {
  process.stdout.write(question + ': ')
  return require('readline-sync').question('')
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function updateEnvFile(config: AdminConfig): void {
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = ''

  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }

  // Update or add admin email
  const adminEmailLine = `ADMIN_EMAIL=${config.email}`
  const adminEmailsLine = `ADMIN_EMAILS=${config.email}`

  if (envContent.includes('ADMIN_EMAIL=')) {
    envContent = envContent.replace(/ADMIN_EMAIL=.*/, adminEmailLine)
  } else {
    envContent += `\n${adminEmailLine}`
  }

  if (envContent.includes('ADMIN_EMAILS=')) {
    envContent = envContent.replace(/ADMIN_EMAILS=.*/, adminEmailsLine)
  } else {
    envContent += `\n${adminEmailsLine}`
  }

  // Update Firebase config
  const firebaseVars = [
    `NEXT_PUBLIC_FIREBASE_API_KEY=${config.firebaseConfig.apiKey}`,
    `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.firebaseConfig.authDomain}`,
    `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.firebaseConfig.projectId}`,
    `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.firebaseConfig.storageBucket}`,
    `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.firebaseConfig.messagingSenderId}`,
    `NEXT_PUBLIC_FIREBASE_APP_ID=${config.firebaseConfig.appId}`
  ]

  firebaseVars.forEach(varLine => {
    const varName = varLine.split('=')[0]
    if (envContent.includes(`${varName}=`)) {
      envContent = envContent.replace(new RegExp(`${varName}=.*`), varLine)
    } else {
      envContent += `\n${varLine}`
    }
  })

  // Update Resend API key
  if (envContent.includes('RESEND_API_KEY=')) {
    envContent = envContent.replace(/RESEND_API_KEY=.*/, `RESEND_API_KEY=${config.resendApiKey}`)
  } else {
    envContent += `\nRESEND_API_KEY=${config.resendApiKey}`
  }

  // Write back to .env.local
  fs.writeFileSync(envPath, envContent.trim() + '\n')
  console.log('✅ Environment variables updated in .env.local')
}

function generateFirebaseInstructions(): void {
  console.log(`
🔥 Firebase Setup Instructions:
1. Go to https://console.firebase.google.com/
2. Create a new project or select an existing one
3. Enable Authentication (Email/Password, Google, Microsoft, Apple)
4. Enable Firestore Database
5. Create a web app in your project
6. Copy the Firebase config values when prompted
7. In Firestore rules, use these rules:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /assessments/{documentId} {
         allow read, write: if request.auth != null;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null;
       }
     }
   }
8. In Authentication, add your admin email to the allowed users list
`)
}

function generateResendInstructions(): void {
  console.log(`
📧 Resend Setup Instructions:
1. Go to https://resend.com/
2. Sign up for an account
3. Verify your email domain
4. Generate an API key
5. Copy the API key for configuration
`)
}

function createAdminUserDoc(config: AdminConfig): void {
  const adminDoc = {
    email: config.email,
    name: config.name,
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users'],
    created_at: new Date().toISOString(),
    last_login: null,
    active: true
  }

  console.log(`
📝 Admin User Document:
Create this document in your Firestore 'users' collection:

Document ID: ${config.email.replace(/[^a-zA-Z0-9]/g, '_')}
Data: ${JSON.stringify(adminDoc, null, 2)}
`)
}

function main(): void {
  console.log('🚀 Learner Assessment - Admin Account Setup\n')

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file already exists. Current configuration will be updated.\n')
  }

  // Collect admin information
  console.log('Please provide the following information:\n')

  let email = ''
  while (!validateEmail(email)) {
    email = promptForInput('Admin email address')
    if (!validateEmail(email)) {
      console.log('❌ Invalid email format. Please try again.')
    }
  }

  const name = promptForInput('Admin full name')

  console.log('\n📋 Firebase Configuration')
  console.log('Please provide your Firebase config values:')
  console.log('(Get these from Firebase Console → Project Settings → General → Your apps)\n')

  const firebaseConfig = {
    apiKey: promptForInput('Firebase API Key'),
    authDomain: promptForInput('Firebase Auth Domain'),
    projectId: promptForInput('Firebase Project ID'),
    storageBucket: promptForInput('Firebase Storage Bucket'),
    messagingSenderId: promptForInput('Firebase Messaging Sender ID'),
    appId: promptForInput('Firebase App ID')
  }

  const resendApiKey = promptForInput('Resend API Key')

  const config: AdminConfig = {
    email,
    name,
    firebaseConfig,
    resendApiKey
  }

  // Update environment file
  updateEnvFile(config)

  // Generate instructions
  generateFirebaseInstructions()
  generateResendInstructions()
  createAdminUserDoc(config)

  console.log(`
✅ Admin Account Setup Complete!

Next Steps:
1. Complete the Firebase setup above
2. Complete the Resend setup above
3. Create the admin user document in Firestore
4. Restart your development server: npm run dev
5. Navigate to http://localhost:3000/admin
6. Sign in with your admin email

Admin Email: ${config.email}
Admin Dashboard: http://localhost:3000/admin

🔒 Security Notes:
- Keep your .env.local file secure and never commit it to version control
- Use a strong password for your admin account
- Enable two-factor authentication on your email account
- Regularly review admin access logs
`)
}

// Check if required packages are installed
try {
  require('readline-sync')
} catch (error) {
  console.log('❌ readline-sync package is required. Installing...')
  execSync('npm install readline-sync', { stdio: 'inherit' })
}

// Run the setup
main()
