# update gas price in postgres [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/peppersec/chainlink_gas_price.svg)](https://hub.docker.com/r/peppersec/chainlink_gas_price/builds)

## install

```
npm i 
cp .env.example .env
```  

setup `POSTGRES_STRING` 

.env
```bash
POSTGRES_STRING=postgresql://USERNAME:PASSWORD@IP:PORT/DBNAME
```

node index.js
