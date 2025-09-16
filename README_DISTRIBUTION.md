# 🧾 BillMaster Pro - Professional Billing Software

**Complete billing solution for small businesses, shops, and enterprises.**

## 🚀 Quick Start

### Desktop Application (Recommended)

1. **Download** the executable for your platform:

   - Windows: `fusion-starter-win.exe`
   - macOS: `fusion-starter-macos`
   - Linux: `fusion-starter-linux`

2. **Run** the application (no installation required)

3. **Access** via browser at `http://localhost:8080`

4. **Start billing!** 💰

### Web Application

Visit the hosted version at your deployed URL.

## ✨ Key Features

### 📊 Bill Management

- **Automatic bill generation** from transaction data
- **Smart bill numbering** (continues from where you left off)
- **Multiple payment modes** (Cash, GPay, Bank)
- **Bill blocking** and number management
- **No mismatches** - generated totals match targets exactly

### 📁 Data Management

- **Excel import/export** for transactions and stock
- **Multi-account support** with data separation
- **Local data storage** (no cloud dependency)
- **Backup and restore** functionality
- **Sample data generation** for testing

### 📋 Reporting & Export

- **PDF generation** with custom headers/footers
- **Excel reports** with detailed breakdowns
- **HTML reports** with BeautifulSoup-like processing
- **Mega reports** consolidating all bills
- **Mismatch detection** and analysis

### 🏪 Stock Management

- **Inventory tracking** with real-time updates
- **Stock reduction** during bill generation
- **Low stock alerts** and monitoring
- **Item-wise quantity management**

### ⚙️ Advanced Features

- **HTML Report Processor** for custom formatting
- **Account switching** for multiple businesses
- **Auto-select items** matching target amounts
- **Tolerance settings** for bill accuracy
- **200-iteration algorithm** for optimal bill generation

## 📖 How to Use

### 1. First Time Setup

- Launch the application
- Create your first account/business
- Import stock data (Excel format)
- Configure business settings

### 2. Daily Operations

- Import daily transactions (Excel)
- Generate bills automatically
- Review and edit bills if needed
- Export reports (PDF, Excel, HTML)

### 3. Data Import Format

**Transaction Data (Excel)**:

```
Date | Customer Name | Total | Payment Mode
15-01-2024 | John Doe | 450 | GPay
15-01-2024 | Jane Smith_c | 320 | Cash
```

**Stock Data (Excel)**:

```
Item Name | Price | Available Quantity
Rice (1kg) | 80 | 150
Sugar (1kg) | 60 | 100
```

### 4. Key Tips

- Customer names ending with `_c` = Cash customers
- Dates must be in DD-MM-YYYY format
- Bill numbers auto-calculate from existing bills
- All data saved locally in browser storage

## 🔧 Technical Details

### System Requirements

- **Desktop**: Windows 10+, macOS 10.15+, or modern Linux
- **Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Memory**: 512MB RAM minimum
- **Storage**: 100MB free space

### Architecture

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Express.js with integrated development server
- **Storage**: Browser localStorage (no external database)
- **Bundling**: Vite with optimized production builds

### Security & Privacy

- ✅ **100% Local** - No data sent to external servers
- ✅ **No tracking** - Complete privacy
- ✅ **Offline capable** - Works without internet
- ✅ **Encrypted storage** - Local data protection

## 📱 Platform-Specific Instructions

### Windows Users

1. Download `fusion-starter-win.exe`
2. Double-click to run
3. Allow through Windows Defender if prompted
4. Access at `http://localhost:8080`

### macOS Users

1. Download `fusion-starter-macos`
2. Right-click → Open (to bypass Gatekeeper)
3. Terminal will open automatically
4. Browser opens to `http://localhost:8080`

### Linux Users

1. Download `fusion-starter-linux`
2. Make executable: `chmod +x fusion-starter-linux`
3. Run: `./fusion-starter-linux`
4. Access at `http://localhost:8080`

## 🆘 Troubleshooting

### Common Issues

**Application won't start**

- Check if port 8080 is available
- Run as administrator (Windows)
- Check antivirus settings

**Browser doesn't open automatically**

- Manually navigate to `http://localhost:8080`
- Check firewall settings
- Try a different browser

**Data not saving**

- Ensure browser allows localStorage
- Check available disk space
- Try clearing browser cache

**Import fails**

- Verify Excel file format
- Check column headers match exactly
- Ensure dates are in DD-MM-YYYY format

### Getting Support

1. Check console logs (F12 in browser)
2. Review this documentation
3. Try with sample data
4. Check system requirements

## 🔄 Updates & Maintenance

### Updating

- Download the latest version
- Replace the old executable
- Your data will be preserved

### Backup

- Export all data to Excel before major updates
- Browser localStorage is automatically backed up
- Consider regular data exports

### Performance

- Application runs entirely locally
- No internet required after initial startup
- Minimal system resources usage

## 📄 License & Credits

**BillMaster Pro** - Professional billing solution

- Built with modern web technologies
- Optimized for small business needs
- Regular updates and improvements

---

## 🚀 Ready to Start?

1. **Download** your platform's executable
2. **Run** the application
3. **Import** your data
4. **Generate** professional bills!

**Your business billing solution is just one click away!** ✨

---

_For technical documentation, see PACKAGING.md and DEPLOYMENT.md_
