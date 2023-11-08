# ticket-bot
base on [Playwright](https://playwright.dev/) 開發的搶票機器人
## Getting Start

### Install
`yarn install`

### Setting
- copy 對應購票平台內部的 config.js.example 並重新命名為 config.js
- 填寫 config.js 內部的資料
  - 登入平台、帳號、密碼
  - 活動 ID：活動網址最後的 id 部分 ex. https://www.indievox.com/activity/detail/{id}
  - 購票細節
    - 場地
    - 張數

### Run Command
indievox
執行 `yarn run indievoxTicketScraper`
