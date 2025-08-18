#!/bin/bash

# Haxplode Backend Azure Deployment Script
# This script deploys the backend to Azure App Service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="haxplode-backend"
RESOURCE_GROUP="haxplode-rg"
LOCATION="eastus"
PLAN_NAME="haxplode-plan"
SKU="B1" # Basic tier, change as needed

echo -e "${GREEN}🚀 Starting Haxplode Backend Azure Deployment${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please login first.${NC}"
    az login
fi

echo -e "${GREEN}✅ Azure CLI check passed${NC}"

# Create resource group if it doesn't exist
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
echo -e "${GREEN}✅ Resource group created/verified${NC}"

# Create App Service plan if it doesn't exist
echo -e "${YELLOW}📋 Creating App Service plan...${NC}"
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --sku $SKU \
    --is-linux \
    --output none
echo -e "${GREEN}✅ App Service plan created/verified${NC}"

# Create web app if it doesn't exist
echo -e "${YELLOW}🌐 Creating web app...${NC}"
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --runtime "NODE|18-lts" \
    --output none
echo -e "${GREEN}✅ Web app created/verified${NC}"

# Configure environment variables
echo -e "${YELLOW}⚙️  Configuring environment variables...${NC}"

# Read from .env file if it exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}📖 Reading environment variables from .env file...${NC}"
    
    # Set each environment variable
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ $line =~ ^[^#].*=.*$ ]]; then
            key=$(echo $line | cut -d'=' -f1)
            value=$(echo $line | cut -d'=' -f2-)
            
            # Remove quotes if present
            value=$(echo $value | sed 's/^"//;s/"$//')
            value=$(echo $value | sed "s/^'//;s/'$//")
            
            echo -e "${YELLOW}🔧 Setting $key...${NC}"
            az webapp config appsettings set \
                --name $APP_NAME \
                --resource-group $RESOURCE_GROUP \
                --settings "$key=$value" \
                --output none
        fi
    done < .env
    
    echo -e "${GREEN}✅ Environment variables configured${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found. Please configure environment variables manually in Azure Portal.${NC}"
fi

# Configure Node.js version
echo -e "${YELLOW}🔧 Configuring Node.js version...${NC}"
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "WEBSITE_NODE_DEFAULT_VERSION=18.17.0" \
    --output none
echo -e "${GREEN}✅ Node.js version configured${NC}"

# Configure startup command
echo -e "${YELLOW}🚀 Configuring startup command...${NC}"
az webapp config set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "npm start" \
    --output none
echo -e "${GREEN}✅ Startup command configured${NC}"

# Enable logging
echo -e "${YELLOW}📝 Enabling application logging...${NC}"
az webapp log config \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --web-server-logging filesystem \
    --output none
echo -e "${GREEN}✅ Logging enabled${NC}"

# Get the web app URL
WEBAPP_URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is available at: https://$WEBAPP_URL${NC}"
echo -e "${GREEN}🔗 Azure Portal: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$APP_NAME${NC}"

# Optional: Deploy code using Git
echo -e "${YELLOW}📤 To deploy your code, you can:${NC}"
echo -e "${YELLOW}   1. Use Azure DevOps or GitHub Actions${NC}"
echo -e "${YELLOW}   2. Use Azure CLI: az webapp deployment source config-local-git${NC}"
echo -e "${YELLOW}   3. Use VS Code Azure extension${NC}"

echo -e "${GREEN}✅ Deployment script completed!${NC}"
