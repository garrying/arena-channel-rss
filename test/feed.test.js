const feed = require('../api/feed')

const chai = require('chai')
const expect = require('chai').expect
const chaiXml = require('chai-xml')
chai.use(chaiXml)

const xml2js = require('xml2js')
const parser = new xml2js.Parser()

const createServer = require('vercel-node-server').createServer
const listen = require('test-listen')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

let server
let url

before(async () => {
  server = createServer(feed)
  url = await listen(server)
})

after(() => {
  server.close()
})

describe('Feed returns the expected responses', async function () {
  this.timeout(10000)

  it('Should be valid XML', async () => {
    const response = await fetch(url + '/feed/arena-influences')
    const responseXML = await response.text()
    expect(responseXML).xml.to.be.valid()
  })

  it('Should present 17 items from a channel', async function () {
    const response = await fetch(url + '/feed/protocol-platform-peers')
    const responseXML = await response.text()
    const feedItems = await parser.parseStringPromise(responseXML).then((result) => result.rss.channel[0].item)
    expect(feedItems).to.have.lengthOf(17)
  })
})
