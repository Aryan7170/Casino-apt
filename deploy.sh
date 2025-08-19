#!/bin/bash

# APT Casino Deployment Script
# This script prepares the project for production deployment

echo "🚀 Preparing APT Casino for production deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint --fix

# Build the project
echo "🏗️  Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready for deployment."
    echo ""
    echo "📋 Deployment checklist:"
    echo "1. ✅ Dependencies installed"
    echo "2. ✅ Code linted"
    echo "3. ✅ Project built successfully"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Push your code to your Git repository"
    echo "2. Connect your repository to Vercel"
    echo "3. Configure environment variables in Vercel dashboard"
    echo "4. Deploy!"
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi
