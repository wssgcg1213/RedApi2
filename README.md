#RedApi2
---
红岩网校 API 系统 (Nodejs) 第二版

####大改版:

  1. 采用 redis 针对对输入流做缓存, 提高缓存命中率
  2. 改成手动装载 plugin, 标准化 plugin 及其配制
  3. 优化各个 插件, 静态资源buffer化
  4. 升级 express, 优化配制
  5. 增加 logger
  6. 后台 socket.io 通知
  
放假前完成.

ZeroLing.