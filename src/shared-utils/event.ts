/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-rest-params */

import { isArray, isFunction } from './util'

// 文本输入获取焦点事件
export const TEXT_FIELD_FOUCS = 'textFieldFocus'

// 元素移动事件
export const MOVE = 'move'

// 容器点击事件
export const CONTAINER_CLICK = 'containerClick'

// 元素菜单点击删除事件
export const TEXT_FIELD_DELETE = 'textFieldDelete'

export default class Events {

  event_list: any = {}
  MaxEventListNum: number | undefined;
  defaultMaxEventListNum = 10;

  /**
   * 订阅、监听器
   *
   * @param {*} eventName 事件名称
   * @param {*} content 回调
   */
  public on(eventName: string, content: () => void) {
    let _event, ctx: any
    if (!isFunction(content)) {
      throw new Error(
        'Events.prototype.on || [eventName, content] -> Error: "content" must be a function'
      )
    }
    _event = this.event_list
    if (!_event) {
      _event = this.event_list = {}
    } else {
      ctx = this.event_list[eventName]
    }
    if (!ctx) {
      ctx = this.event_list[eventName] = content
      ctx.ListenerCount = 1
    } else if (isFunction(ctx)) {
      ctx = this.event_list[eventName] = [ctx, content]
      ctx.ListenerCount = ctx.length
    } else if (isArray(ctx)) {
      ctx.push(content)
      ctx.ListenerCount = ctx.length
    }

    if (!ctx.maxed) {
      if (isArray(ctx)) {
        const len = ctx.length
        if (
          len >
          (this.MaxEventListNum
            ? this.MaxEventListNum
            : this.defaultMaxEventListNum)
        ) {
          ctx.maxed = true
          console.warn(
            'Events.MaxEventListNum || [ MaxEventListNum ] :The number of subscriptions exceeds the maximum, and if you do not set it, the default value is 10'
          )
        } else {
          ctx.maxed = false
        }
      }
    }
  }

  /**
   * 发布、执行器
   *
   * @param {*} eventName 事件名称
   */
  public emit(eventName: string, args?: any): boolean {
    let ctx;
    const _event = this.event_list
    if (_event) {
      ctx = this.event_list[eventName]
    } else {
      console.warn(
        'Events.prototype.emit || [eventName, content] -> Error: "can not find eventName"'
      )
    }
    if (!ctx) {
      return false
    } else if (isFunction(ctx)) {
      ctx.apply(this, Array.prototype.slice.call(arguments, 1))
    } else if (isArray(ctx)) {
      for (let i = 0; i < ctx.length; i++) {
        ctx[i].apply(this, Array.prototype.slice.call(arguments, 1))
      }
    }
    return true
  }

  /**
   *只监听一次事件，执行后立即删除
   *
   * @param {*} event 事件名称
   * @param {*} content 回调
   */
  public once(event: string, content: () => void): this {
    if (!isFunction(content)) {
      throw new Error(
        'Events.prototype.once || [eventName, content] -> Error: "content" must be a function'
      )
    }
    this.on(event, this.dealOnce(this, event, content))
    return this
  }
  /**
   * 删除某个事件的某个订阅
   *
   * @param {*} type 事件名称
   * @param {*} content 函数（回调函数）
   * @returns 当前实例
   */
  public removeListener(type: string, content: () => void): this {
    const _event = this.event_list;
    let ctx;
    let index = 0
    if (!isFunction(content)) {
      throw new Error(
        'Events.prototype.removeListener || [eventName, content] -> Error: "content" must be a function'
      )
    }
    if (!_event) {
      return this
    } else {
      ctx = this.event_list[type]
    }
    if (!ctx) {
      return this
    }
    if (isFunction(ctx)) {
      if (ctx === content) {
        delete _event[type]
      }
    } else if (isArray(ctx)) {
      for (let i = 0; i < ctx.length; i++) {
        if (ctx[i] === content) {
          this.event_list[type].splice(i - index, 1)
          ctx.ListenerCount = ctx.length
          if (this.event_list[type].length === 0) {
            delete this.event_list[type]
          }
          index++
        }
      }
    }
    return this
  }

  public removeAllListener(type: string): this {
    const _event = this.event_list
    if (!_event) {
      return this
    }
    const ctx = this.event_list[type]
    if (arguments.length === 0 && !type) {
      const keys = Object.keys(this.event_list)
      for (let i = 0, key; i < keys.length; i++) {
        key = keys[i]
        delete this.event_list[key]
      }
    }
    if (ctx || isFunction(ctx) || isArray(ctx)) {
      delete this.event_list[type]
    } else {
      return this
    }
  }

  /**
   * 获得事件类型的监听者数量
   *
   * @param {*} type 事件名/可忽略
   * @returns type ？ 数量 ；所有事件的数量，{}
   */
  getListenerCount(type: string): number {
    const ev_name = type;
    const Count_obj: any = {}
    const _event = this.event_list
    if (!_event || Object.keys(_event).length === 0) {
      return undefined
    }
    if (!ev_name) {
      for (const attr in _event) {
        Count_obj[attr] = _event[attr].ListenerCount
      }
      return Count_obj
    }
    const ctx = this.event_list[type]
    if (ctx && ctx.ListenerCount) {
      return ctx.ListenerCount
    } else {
      return 0
    }
  }

  /**
   * 处理 当订阅once一次事件
   * 监听执行后删除
   * @param {*} target
   * @param {*} type
   * @param {*} content
   * @returns
   */
  dealOnce(target: this, type: string, content: () => void): () => void {
    let fired = false
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    function packageFun(...args) {
      that.removeListener(type, packageFun)
      if (!fired) {
        fired = true
        content.apply(target, args)
      }
      // eslint-disable-next-line no-self-assign
      content = content
    }
    return packageFun
  }
}
