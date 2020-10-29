const RSS = require('rss')
const Arena = require('are.na')

const arena = new Arena({ accessToken: process.env.ARENA_TOKEN })
const arenaURL = 'https://www.are.na'
let feed = {}

const arenaChannelMeta = (channelSlug, reqHostname) => {
  return arena
    .channel(channelSlug)
    .get()
    .then(chan => {
      const chanDescription = () => {
        if (chan.metadata) {
          return chan.metadata.description
        } else {
          return '—'
        }
      }
      feed = new RSS({
        title: `Are.na / ${chan.title}`,
        description: chanDescription(),
        site_url: `${arenaURL}/${chan.user.slug}/${chan.slug}`,
        language: 'en',
        image_url: 'https://d2hp0ptr16qg89.cloudfront.net/assets/127302a/touch-icon-iphone-retina.png',
        generator: 'Are.na Channel to RSS',
        feed_url: `http://${reqHostname}/api/feed`
      })
    })
    .catch(err => console.log(err))
}

const arenaChannelBlocksContents = item => {
  if (item.class === 'Text') {
    return `${item.content_html}`
  } else if (item.class === 'Channel') {
    return `<a href="${arenaURL}/${item.user.slug}/${item.slug}" target="_blank">${arenaURL}/${item.user.slug}/${item.slug}</a>`
  } else if (item.class === 'Media') {
    return `${item.embed.html}`
  } else if (item.class === 'Attachment') {
    return `<a href="${item.attachment.url}" target="_blank"><img src="${item.image.display.url}"></img></a>`
  } else if (item.class === 'Link') {
    return `<a href="${item.source.url}" target="_blank"><img src="${item.image.display.url}"></img></a>`
  } else if (item.class === 'Image') {
    return `<a href="${item.image.original.url}" target="_blank"><img src="${item.image.large.url}"></img></a>`
  } else {
    console.log(item)
  }
}

const arenaChannelBlocks = channelName => {
  return arena
    .channel(channelName)
    .contents({ direction: 'desc' })
    .then(chan => {
      chan.map(item => {
        feed.item({
          title: item.title,
          guid: `${arenaURL}/block/${item.id}`,
          url: `${arenaURL}/block/${item.id}`,
          description: arenaChannelBlocksContents(item),
          author: item.user.username,
          date: new Date(item.created_at)
        })
      })
    })
    .catch(err => console.log(err))
}

async function feedRequest (req, res) {
  const chanSlug = req.url.replace('/feed/', '')
  const reqHostname = req.headers['x-now-deployment-url']

  return arenaChannelMeta(chanSlug, reqHostname).then(() => {
    return arenaChannelBlocks(chanSlug)
  }).then(() => {
    res.send(feed.xml())
  })
}

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/rss+xml;charset=utf-8')
  feedRequest(req, res)
}
