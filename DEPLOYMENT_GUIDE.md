# Haxplode Azure Deployment Guide

## Prerequisites

1. **Azure Account**: Active Azure subscription
2. **Azure CLI**: Installed and configured
3. **GitHub Actions**: Repository connected to Azure
4. **Databases**: Azure SQL Database and MongoDB Atlas configured
5. **Environment Variables**: All required secrets configured

## Azure Resources Setup

### 1. Azure SQL Database
```bash
# Create resource group
az group create --name haxplode-rg --location eastus

# Create SQL Server
az sql server create \
  --name haxplode-sql-server \
  --resource-group haxplode-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password "YourStrongPassword123!"

# Create SQL Database
az sql db create \
  --resource-group haxplode-rg \
  --server haxplode-sql-server \
  --name haxplode-db \
  --edition Standard \
  --capacity 10

# Configure firewall rules
az sql server firewall-rule create \
  --resource-group haxplode-rg \
  --server haxplode-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 2. MongoDB Atlas (Alternative to Cosmos DB)
1. Create MongoDB Atlas account
2. Create cluster (M0 free tier or higher)
3. Create database user
4. Configure network access (allow all IPs: 0.0.0.0/0)
5. Get connection string

### 3. Azure App Service
```bash
# Create App Service Plan
az appservice plan create \
  --name haxplode-app-plan \
  --resource-group haxplode-rg \
  --sku B1 \
  --is-linux

# Create Web App for Backend
az webapp create \
  --resource-group haxplode-rg \
  --plan haxplode-app-plan \
  --name haxplode-backend \
  --runtime "NODE|18-lts"

# Create Web App for Frontend
az webapp create \
  --resource-group haxplode-rg \
  --plan haxplode-app-plan \
  --name haxplode-frontend \
  --runtime "NODE|18-lts"
```

### 4. Azure Storage Account (for file uploads)
```bash
# Create storage account
az storage account create \
  --name haxplodestorage \
  --resource-group haxplode-rg \
  --location eastus \
  --sku Standard_LRS

# Create container for uploads
az storage container create \
  --name uploads \
  --account-name haxplodestorage
```

## Environment Variables Configuration

### Backend Environment Variables
Configure these in Azure App Service Configuration:

```bash
# Database Configuration
AZURE_SQL_SERVER=haxplode-sql-server.database.windows.net
AZURE_SQL_DATABASE=haxplode-db
AZURE_SQL_USERNAME=sqladmin
AZURE_SQL_PASSWORD=YourStrongPassword123!
AZURE_SQL_PORT=1433
AZURE_SQL_OPTIONS_ENCRYPT=true
AZURE_SQL_OPTIONS_TRUST_SERVER_CERTIFICATE=false

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/haxplode?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# App Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://haxplode-frontend.azurewebsites.net

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email Configuration (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend Environment Variables
Configure these in Azure App Service Configuration:

```bash
# API Configuration
VITE_API_URL=https://haxplode-backend.azurewebsites.net/api

# Socket.io Configuration
VITE_SOCKET_URL=https://haxplode-backend.azurewebsites.net

# App Configuration
VITE_APP_NAME=Haxplode
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production

# Google OAuth (if using)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## GitHub Actions CI/CD Setup

### 1. Backend Workflow
Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Build application
      run: |
        cd backend
        npm run build
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'haxplode-backend'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND }}
        package: backend/
```

### 2. Frontend Workflow
Create `.github/workflows/frontend-deploy.yml`:

```yaml
name: Deploy Frontend to Azure

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build application
      run: |
        cd frontend
        npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_SOCKET_URL: ${{ secrets.VITE_SOCKET_URL }}
        VITE_APP_NAME: ${{ secrets.VITE_APP_NAME }}
        VITE_APP_VERSION: ${{ secrets.VITE_APP_VERSION }}
        VITE_NODE_ENV: production
        VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'haxplode-frontend'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND }}
        package: frontend/dist/
```

## GitHub Secrets Configuration

Add these secrets to your GitHub repository:

### Required Secrets
- `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND`: Backend app publish profile
- `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND`: Frontend app publish profile
- `VITE_API_URL`: Production API URL
- `VITE_SOCKET_URL`: Production Socket URL
- `VITE_APP_NAME`: App name
- `VITE_APP_VERSION`: App version
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Deployment Steps

### 1. Pre-deployment Checklist
- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] GitHub secrets added
- [ ] Azure resources created
- [ ] SSL certificates configured (if needed)

### 2. Initial Deployment
```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Initial deployment setup"
git push origin main
```

### 3. Verify Deployment
1. **Backend Health Check**:
   ```bash
   curl https://haxplode-backend.azurewebsites.net/health
   ```

2. **Frontend Access**:
   - Visit: `https://haxplode-frontend.azurewebsites.net`
   - Verify application loads
   - Test authentication flow

3. **Database Connections**:
   - Check backend logs in Azure Portal
   - Verify SQL and MongoDB connections

### 4. Post-deployment Testing
1. **API Testing**:
   ```bash
   # Test authentication
   curl -X POST https://haxplode-backend.azurewebsites.net/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123","role":"participant"}'
   ```

2. **Frontend Testing**:
   - Test all user flows
   - Verify real-time features
   - Check file uploads
   - Test responsive design

## Monitoring & Maintenance

### 1. Azure Monitor Setup
```bash
# Enable Application Insights
az monitor app-insights component create \
  --app haxplode-insights \
  --location eastus \
  --resource-group haxplode-rg \
  --application-type web
```

### 2. Log Analytics
- Configure log collection
- Set up alerts for errors
- Monitor performance metrics

### 3. Backup Strategy
```bash
# Configure SQL Database backup
az sql db update \
  --resource-group haxplode-rg \
  --server haxplode-sql-server \
  --name haxplode-db \
  --backup-storage-redundancy Geo
```

### 4. Scaling Configuration
```bash
# Scale up App Service Plan if needed
az appservice plan update \
  --name haxplode-app-plan \
  --resource-group haxplode-rg \
  --sku S1
```

## Security Configuration

### 1. SSL/TLS
- Azure App Service provides free SSL certificates
- Configure custom domain if needed

### 2. Network Security
```bash
# Configure VNet integration if needed
az webapp vnet-integration add \
  --name haxplode-backend \
  --resource-group haxplode-rg \
  --vnet haxplode-vnet \
  --subnet backend-subnet
```

### 3. Authentication
- Configure Azure AD if needed
- Set up OAuth providers
- Configure CORS properly

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check firewall rules
   - Verify connection string
   - Check credentials

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies
   - Check environment variables

3. **Runtime Errors**
   - Check application logs
   - Verify environment variables
   - Check file permissions

4. **CORS Issues**
   - Verify CORS configuration
   - Check frontend URL
   - Test with Postman

### Debug Commands
```bash
# Check app service logs
az webapp log tail --name haxplode-backend --resource-group haxplode-rg

# Check app service configuration
az webapp config show --name haxplode-backend --resource-group haxplode-rg

# Restart app service
az webapp restart --name haxplode-backend --resource-group haxplode-rg
```

## Cost Optimization

### 1. Resource Sizing
- Start with minimal resources
- Scale up based on usage
- Use auto-scaling rules

### 2. Database Optimization
- Use appropriate service tier
- Configure backup retention
- Monitor query performance

### 3. Storage Optimization
- Use appropriate storage tier
- Configure lifecycle policies
- Monitor usage patterns

## Maintenance Schedule

### Daily
- Monitor error logs
- Check application health
- Review performance metrics

### Weekly
- Review security logs
- Update dependencies
- Backup verification

### Monthly
- Performance review
- Cost analysis
- Security audit
- Update documentation

This deployment guide ensures a smooth transition from development to production on Azure.
