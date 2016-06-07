
#had merge into badjs-mq 


#badjs-openapi

> A open api for other system easy to access


# 启动参数
--debug  log 采用debug 级别, 默认使用info 

--project 使用测试环境（ project.debug.json ）配置 ， 默认使用 project.json

 
# 配置说明
```
{
    "zmq" : {  // badjs-mq 的地址
        "url" : "tcp://10.143.132.205:10000"
    },
    "port": 9500   // 启动的端口
}
```
