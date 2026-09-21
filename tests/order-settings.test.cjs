const {test}=require('node:test');
const assert=require('node:assert/strict');
// Isolate persistence/Telegram; these tests must never write live data or send messages.
let site=null;
const sitePath=require.resolve('../netlify/functions/site-data');
const telegramPath=require.resolve('../netlify/functions/lib/telegram-config');
require.cache[sitePath]={id:sitePath,filename:sitePath,loaded:true,exports:{readData:async()=>site}};
require.cache[telegramPath]={id:telegramPath,filename:telegramPath,loaded:true,exports:{getTelegramConfig:async()=>({})}};
const {handler}=require('../netlify/functions/create-order');
const event={httpMethod:'POST',headers:{},body:JSON.stringify({id:'ORD-TEST123',telegramId:'@customer',items:[{pid:1,qty:1,price:10}]})};
test('checkout respects closed shop and hidden checkout on the server',async()=>{
    for (site of [{shopEnabled:false},{visible:{checkoutForm:false}},{visible:{checkoutSubmit:false}}]){
        const response=await handler(event);assert.equal(response.statusCode,503);assert.equal(JSON.parse(response.body).code,'SHOP_UNAVAILABLE');
    }
});
test('hidden name and phone are optional; visible fields remain required',async()=>{
    site=null;assert.equal((await handler(event)).statusCode,400);
    site={visible:{checkoutName:false,checkoutPhone:false}};
    // Validation passes; missing private bot config then returns 503, not 400.
    const result=await handler(event);assert.equal(result.statusCode,503);assert.match(JSON.parse(result.body).error,/ربات/);
    site={visible:{checkoutName:false}};assert.equal((await handler(event)).statusCode,400);
});
