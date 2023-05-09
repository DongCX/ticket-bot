const { chromium } = require("playwright")
const { AUTH, ACTIVITY, ORDER } = require('./config')

const indievoxTicketScraper = async () => {
  const { page } = await createBrowserAndPage()

  await toActivityPage({ page })
  await auth({ page })
  await backToActivityPage({ page })
  await selectGame({ page })
  await selectArea({ page })
  await buyTicket({ page })
}

const createBrowserAndPage = async () => {
  // create a browser instance and set headless to false so that we can see the browser's operation
  const browser = await chromium.launch({ headless: false })

  // create a new page instance will open a new tab in the browser
  const page = await browser.newPage()

  // set timeout to 6000000ms (100 minutes) to prevent close the browser when the script is running
  page.setDefaultTimeout(6000000)

  return { browser, page }
}

const toActivityPage = async ({ page }) => {
  await page.goto(`https://www.indievox.com/activity/detail/${ACTIVITY.ID}`)
}

const auth = async ({ page }) => {
  const authFunction = {
    'facebook': facebookAuth,
  }

  await authFunction[AUTH.Service]({ page })
}

const facebookAuth = async ({ page }) => {
  // click login button
  await page.getByRole('link', { name: ' 會員登入／註冊' }).click()

  // find auth dialog and click facebook login button
  await page.getByRole('dialog').getByRole('link', { name: /facebook/ }).click()

  const REGEX_TO_SKIP_QUERY = /https:\/\/www\.facebook\.com\/login\.php/i
  await page.waitForURL(REGEX_TO_SKIP_QUERY)
  await page.getByPlaceholder('電子郵件地址或手機號碼').type(AUTH.Account)
  await page.locator('#pass').type(AUTH.Password)
  await page.getByRole('button', { name: '登入' }).click()
  // wait for redirect to indievox
}

const backToActivityPage = async ({ page }) => {
  const REGEX_OF_ACTIVITY_PAGE = new RegExp(`https://www.indievox.com/activity/detail/${ACTIVITY.ID}`, 'i')
  await page.waitForURL(REGEX_OF_ACTIVITY_PAGE)
}

const fetchBuyButton = async ({ page }) => {
  // refresh ticket area by clicking the link
  await page.getByRole('link', { name: '立即購票' }).click()
  const API = `https://www.indievox.com/activity/game/${ACTIVITY.ID}`
  await page.waitForResponse(API)

  // wait for ticket area to be rendered, and check if the button is enabled
  await page.locator('#gameListContainer').waitFor('visible')
  const purchaseButton = await page.locator('#gameList').locator('.fcTxt').getByRole('button')
  const buyable = await purchaseButton.isEnabled()

  // return button if it is enabled, otherwise return null
  return buyable ? purchaseButton : null
}

const selectGame = async ({ page }) => {
  let buyButton = null

  while (!buyButton) {
    // loop until the buy button is enabled
    buyButton = await fetchBuyButton({ page })
  }

  await buyButton.click()
}

const selectArea = async ({ page }) => {
  // wait for the page to be redirected to the area selection page
  await page.waitForURL(`https://www.indievox.com/ticket/area/${ACTIVITY.ID}/**`)

  // select area
  await page.locator(`//div[contains(@class, 'zone')]//a[contains(text(), ${ORDER.Area})]`).click()
}

const buyTicket = async ({ page }) => {
  // wait for the page to be redirected to the ticket selection page
  await page.waitForURL(`https://www.indievox.com/ticket/ticket/${ACTIVITY.ID}/**`)

  // select ticket count
  await page.locator('#TicketForm_ticketPrice_01').selectOption(ORDER.Count)

  // click agree checkbox
  await page.locator('#TicketForm_agree').click()

  // focus on verify code input
  await page.locator('#TicketForm_verifyCode').focus()
}

module.exports = {
  indievoxTicketScraper,
}
