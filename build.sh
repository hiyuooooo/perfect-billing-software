#!/bin/bash

# Billing Software - Build Script for Linux/Mac
# This script builds the application for distribution

echo "============================================="
echo "   Billing Software - Build for Unix/Mac"
echo "============================================="
echo

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored text
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    print_info "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    print_info "Please install npm (usually comes with Node.js)"
    exit 1
fi

print_info "Node.js version: $(node --version)"
print_info "npm version: $(npm --version)"
echo

# Install dependencies
print_info "Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo

# Build the application
print_info "Building application..."
if npm run build; then
    print_status "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

echo

# Detect OS and build appropriate executable
OS=$(uname -s)
case $OS in
    "Darwin")
        print_info "Detected macOS - Building Mac executable..."
        if npm run pack:exe:mac; then
            print_status "macOS executable created successfully"
            EXECUTABLE="executables/fusion-starter-macos"
        else
            print_error "Failed to create macOS executable"
            exit 1
        fi
        ;;
    "Linux")
        print_info "Detected Linux - Building Linux executable..."
        if npm run pack:exe:linux; then
            print_status "Linux executable created successfully"
            EXECUTABLE="executables/fusion-starter-linux"
        else
            print_error "Failed to create Linux executable"
            exit 1
        fi
        ;;
    *)
        print_warning "Unknown OS: $OS"
        print_info "Building for all platforms..."
        if npm run pack:exe:all; then
            print_status "All executables created successfully"
            EXECUTABLE="executables/"
        else
            print_error "Failed to create executables"
            exit 1
        fi
        ;;
esac

echo
echo "============================================="
print_status "Build completed successfully!"
echo
print_info "📁 Files created:"
echo "   • $EXECUTABLE"
echo "   • dist/spa/ (web files)"
echo
print_info "🚀 To run the executable:"
if [[ $OS == "Darwin" ]]; then
    echo "   ./executables/fusion-starter-macos"
elif [[ $OS == "Linux" ]]; then
    echo "   ./executables/fusion-starter-linux"
    echo "   (You may need to: chmod +x executables/fusion-starter-linux)"
else
    echo "   Check the executables/ folder"
fi
echo
print_info "🌐 To deploy to web:"
echo "   Upload dist/spa/ folder to your web server"
echo
print_info "📖 For more information, see PACKAGING.md"
echo "============================================="
