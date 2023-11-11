# 選擇 Node.js 的官方映像作為基礎映像
FROM node:18

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安裝依賴
RUN yarn install

# 複製所有源代碼到工作目錄
COPY . .

# 暴露容器將要監聽的端口
EXPOSE 1337

# 定義環境變量
ENV NODE_ENV development

# 運行 Strapi 開發伺服器，包括 env-cmd 命令
CMD [ "npx", "env-cmd", "-f", "./env/.env.dev", "strapi", "develop" ]
