
import Behavior from './behavior'
import Reporter from './reporter'
import EventEmitter from './event-emitter'
import PluginSystem from './plugins'


class Logger extends EventEmitter{
  constructor(context){
    super(context)
  }

  init(){
    this.context.reporter = new Reporter(context)
    this.context.behavior = new Behavior(context)
    this.context.pluginSystem = new PluginSystem(this.context)
    this.context.adapter.init()
    this.context.pluginSystem.loadPluginsFromConfig()

  }

  bindEvents(){

  }

  onReady(){

  }

  addBehavior(){

  }

  sendBehavior(){

  }

  report(){

  }

  set(){

  }

  get(){

  }



}

export default Logger;