const {test}=require('node:test');
const assert=require('node:assert/strict');

// ---- Mocks: Telegram HTTP + private config + orders; real support lib over /tmp ----
const fetchPath=require.resolve('node-fetch');
const calls=[];
let messageId=5000;
require.cache[fetchPath]={id:fetchPath,filename:fetchPath,loaded:true,exports:async(url,opts)=>{
    const method=String(url).split('/botT/')[1]||'';
    const body=JSON.parse(opts.body||'{}');
    const entry={method,body,resultId:null};
    if(method==='sendMessage'||method==='sendPhoto'){entry.resultId=++messageId;}
    calls.push(entry);
    return {ok:true,json:async()=>({ok:true,result:entry.resultId?{message_id:entry.resultId}:{url:'https://old.example/x',allowed_updates:['message']}})};
}};
const tgPath=require.resolve('../netlify/functions/lib/telegram-config');
require.cache[tgPath]={id:tgPath,filename:tgPath,loaded:true,exports:{getTelegramConfig:async()=>({botToken:'T',chatId:'100',botUsername:'demo_bot',cardNumber:'',cardHolder:'',siteUrl:''})}};
const ordersPath=require.resolve('../netlify/functions/lib/orders');
require.cache[ordersPath]={id:ordersPath,filename:ordersPath,loaded:true,exports:{findOrder:async()=>null,findPendingReceiptOrder:async()=>null,loadOrders:async()=>[],updateOrder:async()=>null,saveOrders:async()=>{}}};
// Controllable blob layer: 'ok' persists to /tmp (non-production), 'fail' simulates
// a production runtime whose Netlify Blobs connection is broken.
const blobPath=require.resolve('../netlify/functions/lib/blob-store');
let blobMode='ok';
require.cache[blobPath]={id:blobPath,filename:blobPath,loaded:true,exports:{
    isProductionRuntime:()=>blobMode==='fail',
    openBlobStore:async()=>({store:null,error:blobMode==='fail'?new Error('blob down'):null}),
    productionPersistError:m=>new Error(m),
    checkBlobStorage:async()=>({ready:false,error:'x'}),
    BLOB_ENV_HINT:''
}};
const {handler}=require('../netlify/functions/telegram-bot');
const event=body=>({httpMethod:'POST',headers:{},body:JSON.stringify(body)});
const sendsTo=chat=>calls.filter(c=>c.method==='sendMessage'&&String(c.body.chat_id)===String(chat));

test('customer support text reaches the admin and the customer gets a confirmation',async()=>{
    calls.length=0;
    const res=await handler(event({message:{chat:{id:55},from:{id:55,first_name:'Ali',username:'ali_user'},text:'سلام مشکل دارم'}}));
    assert.equal(res.statusCode,200);
    const adminMsg=sendsTo('100').find(c=>c.body.text.includes('سلام مشکل دارم'));
    assert.ok(adminMsg,'admin received the relayed customer message');
    assert.match(adminMsg.body.text,/پشتیبانی/);
    assert.match(adminMsg.body.text,/Ali/);
    const confirm=sendsTo(55).find(c=>c.body.text.includes('به پشتیبانی ارسال شد'));
    assert.ok(confirm,'customer got the delivery confirmation');
});

test('admin reply to the forwarded message is delivered back to the customer',async()=>{
    const adminMsg=calls.find(c=>String(c.body.chat_id)==='100'&&c.body.text.includes('سلام مشکل دارم'));
    assert.ok(adminMsg&&adminMsg.resultId);
    calls.length=0;
    const res=await handler(event({message:{chat:{id:100},from:{id:100},text:'پاسخ ادمین به مشتری',reply_to_message:{message_id:adminMsg.resultId}}}));
    assert.equal(res.statusCode,200);
    const toCustomer=sendsTo('55').find(c=>c.body.text==='پاسخ ادمین به مشتری');
    assert.ok(toCustomer,'customer received the admin reply');
    assert.equal(toCustomer.body.parse_mode,undefined,'admin words are relayed without HTML parsing');
});

test('broken persistent storage never blocks delivery to the admin',async()=>{
    blobMode='fail'; // saveSupportState now throws in "production"
    calls.length=0;
    const res=await handler(event({message:{chat:{id:77},from:{id:77,first_name:'Reza'},text:'پیام هنگام قطعی ذخیره‌سازی'}}));
    blobMode='ok';
    assert.equal(res.statusCode,200,'webhook must not 500 when the session store is down');
    const adminMsg=sendsTo('100').find(c=>c.body.text.includes('پیام هنگام قطعی ذخیره‌سازی'));
    assert.ok(adminMsg,'admin still received the message while storage failed');
});

test('admin free message (no reply) routes to the only recent support session',async()=>{
    calls.length=0;
    // chat 55 has a fresh session from the first test; chat 77 session save failed.
    const res=await handler(event({message:{chat:{id:100},from:{id:100},text:'پاسخ بدون ریپلای'}}));
    assert.equal(res.statusCode,200);
    const toCustomer=sendsTo('55').find(c=>c.body.text==='پاسخ بدون ریپلای');
    assert.ok(toCustomer,'free admin message was routed to the recent customer');
    assert.ok(sendsTo('100').some(c=>c.body.text.includes('ارسال شد')),'admin got the routing confirmation');
});

test('/start self-heals a drifted or incomplete webhook',async()=>{
    calls.length=0;
    const ev={httpMethod:'POST',headers:{host:'example.com','x-forwarded-proto':'https'},body:JSON.stringify({message:{chat:{id:9},from:{id:9},text:'/start'}})};
    const res=await handler(ev);
    assert.equal(res.statusCode,200);
    const repair=calls.find(c=>c.method==='setWebhook');
    assert.ok(repair,'setWebhook was called to repair the webhook');
    assert.equal(repair.body.url,'https://example.com/.netlify/functions/telegram-bot');
    assert.deepEqual(repair.body.allowed_updates,['message','callback_query']);
});
