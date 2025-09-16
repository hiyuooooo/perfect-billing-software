# Billing Software - Packaging Instructions

This billing software can be packaged for both executable distribution and web deployment.

## 📦 Building Executables (.exe, .app, Linux binary)

### Prerequisites

```bash
npm install
```

### Package for All Platforms

```bash
npm run pack:exe:all
```

This creates executables for Windows, macOS, and Linux in the `executables/` folder.

### Package for Specific Platforms

**Windows (.exe)**

```bash
npm run pack:exe:win
```

**macOS (.app)**

```bash
npm run pack:exe:mac
```

**Linux (binary)**

```bash
npm run pack:exe:linux
```

### Manual Packaging

```bash
npm run pack:exe
```

Creates executables for the current platform.

## 🌐 Web Deployment

### Build for Web

```bash
npm run build:web
```

### Deploy Options

**1. Static Hosting (Netlify, Vercel)**

- Upload the `dist/spa/` folder to your static hosting provider
- Configure the server to serve `index.html` for all routes (SPA routing)

**2. Full-Stack Hosting (Railway, Render, Heroku)**

- Use `npm run build` to build the application
- Use `npm start` as the start command
- Ensure environment variables are set correctly

**3. Self-Hosting**

```bash
npm run build
npm start
```

The application will run on port 8080 by default.

## 📁 Output Structure

### Executables

After running packaging commands, you'll find:

```
executables/
├── fusion-starter-win.exe     # Windows executable
├── fusion-starter-macos       # macOS executable
└── fusion-starter-linux       # Linux executable
```

### Web Build

```
dist/
├── spa/                       # Frontend static files
│   ├── index.html
│   ├── assets/
│   └── ...
└── server/                    # Backend server files
    └── node-build.mjs
```

## 🚀 Usage

### Executable Usage

1. Download the appropriate executable for your platform
2. Double-click to run (Windows/macOS) or `./fusion-starter-linux` (Linux)
3. Open browser to `http://localhost:8080`
4. Start using the billing software!

### Web Usage

1. Visit the deployed URL
2. The application includes:
   - Bill generation and management
   - Customer transaction import
   - Stock management
   - HTML report processing
   - Account separation
   - Data export (Excel, PDF, HTML)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8080
NODE_ENV=production
```

### Custom Port

```bash
PORT=3000 npm start
```

## 📋 Features Included

- ✅ **Bill Generation**: Auto-generate bills from transactions
- ✅ **Stock Management**: Track inventory and stock levels
- ✅ **Customer Management**: Handle customer data and payment modes
- ✅ **Report Generation**: Export bills in HTML, PDF, Excel formats
- ✅ **Account Separation**: Multi-account support with data isolation
- ✅ **Bill Blocking**: Block specific bill numbers
- ✅ **HTML Processing**: BeautifulSoup-like HTML manipulation
- ✅ **Data Import**: Excel file import for transactions and stock
- ✅ **Responsive UI**: Works on desktop and mobile devices

## 🛠️ Development

### Run in Development Mode

```bash
npm run dev
```

### Build and Test

```bash
npm run build
npm run preview
```

### Type Checking

```bash
npm run typecheck
```

## 📝 Notes

- **Executable files are self-contained** - no need to install Node.js separately
- **Data is stored locally** in browser localStorage (for web) or local files (for executable)
- **Cross-platform compatibility** - works on Windows, macOS, and Linux
- **No internet required** after initial download (for executables)
- **Automatic bill numbering** starts where previous bills ended
- **Zero configuration** - works out of the box

## 🔒 Security

- All data is stored locally
- No external data transmission
- HTTPS recommended for web deployment
- Regular updates recommended

## 📞 Support

For issues or questions:

1. Check the console logs for errors
2. Ensure all dependencies are installed
3. Verify correct Node.js version (18+)
4. Check firewall settings for network access

---

**Ready to use!** 🎉 Your billing software is now packaged and ready for distribution.
