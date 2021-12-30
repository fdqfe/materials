
import Config from './config'
import BroswerAdapter from './adapters/Broswer'
import BaseLogger from './base'

const BrowserLogger = (options) => {
  const context = {}

  const config = new Config(options
    //todo
  )
  context.config = config


  const adapter = new BroswerAdapter(context)

  context.adapter = adapter

  const logger = new BaseLogger(context)

  context.logger = logger

  context.logger.init()

  return logger
}


if (window.__logger) {
  try {
    const {
      o: onReadyFns = [],
      r: reports = [],
      e: errors = [],
      s: settings = [],
      config,
    } = window.__logger

    if (!config) {
      throw new Error('missing config')
    }

    const logger = BrowserLogger(config)
    window.__logger = logger

    reports.forEach(args => logger.report(...args))
    settings.forEach(args => logger.set(...args))
    onReadyFns.forEach(args => logger.onReady(...args))
    logger.onReady(() => {
      errors.forEach(args => {
        const errorHandler = logger.context.pluginSystem.plugins.error

        if (errorHandler) {
          errorHandler.handleEvents(args)
        }
      })
    })


  } catch (error) {
    console.error(`[ik-logger]: Initialize fail: ${error.message}`)

  }
}