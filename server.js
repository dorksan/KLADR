const http = require("http");
const fs = require("fs");

http.createServer((request, response)=>{
    // если запрошены данные xml
    if(request.url == "/data"){
        fs.readFile("data.json", (_, data) => response.end(data));
    }
    else{
        fs.readFile("/Users/arbuz/WebstormProjects/KLADR/index.html", (_, data) => response.end(data));
    }
}).listen(3000, ()=>console.log("Сервер запущен по адресу http://localhost:3000"));