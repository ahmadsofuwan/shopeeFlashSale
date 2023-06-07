require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const express = require('express');
const app = express();
const serverPort = process.env.PORT;
const minDic = process.env.DIC;
const BOT_URL = process.env.BOT_URL;
const PHONE = process.env.PHONE;

app.listen(serverPort, () => {
    console.log('Server berjalan pada port '+serverPort);
  });
function shopee(URL) {
    
    (async function () {
      const browser = await puppeteer.launch({
        // executablePath:chromium.path,
        // userDataDir: './my-user-data',
        headless: "new",
        args: [ 
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-suid-sanbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--single-process',//this one does't work ini windows
          '--disable-gpu',
      ],
      
      });
      const page = await browser.newPage();
      

      await page.goto(URL);
      
      await page.evaluate(() => {
        const script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        document.head.appendChild(script);
      });
      await page.waitForTimeout(2000);
      await autoScroll(page)
    
      var produck = await page.evaluate((minDic) => {
        var objs = $('span.percent');
        const result = [];
        $.each(objs, function( i, obj ) {
            var status=  $(obj).closest('a').find('.sM7qUC').length;
            if(status != 0){
                return
            }

            var tempName=  $(obj).closest('a').find('.ne3HDa').text();
            var tempPrice=  $(obj).closest('a').find('div.rMJoYU > div > div > div > span').closest("div").text();
            var templink =  "https://shopee.co.id"+$(obj).closest('a').attr("href");
            var percent = $(obj).text();
            //number only 
            var realPrice = tempPrice.split("Rp")[1].replace(/\D/g, '');
            var price = tempPrice.split("Rp")[2].replace(/\D/g, '');
            percent = percent.replace(/\D/g, '');
            
            if( parseInt(percent) >= parseInt(minDic)){
                result.push({
                    'name':tempName,
                    'price':"Rp."+new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 3 }).format(price),
                    'realprice':"Rp."+new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 3 }).format(realPrice),
                    'href':templink,
                    'percent':percent+"%",
                });
            }
            
            

          });
      
        return result;
    },minDic);
    console.log(produck);
    var msg = "";
    await produck.forEach(data => {
        if(msg == ""){
            msg = "*DISKON FLAHSALE SHOPEE >"+minDic+"%*\nBy_OnemonBot\n\n"
        }
        msg +="*"+data.percent+"*\n";
        msg +="Nama : "+data.name+"\n";
        msg +="Harga: ~"+data.realprice+"~ "+data.price+"\n";
        msg +=data.href+"\n\n";
    });
    browser.close();
    const postData = { phone: PHONE, massage: msg };
    axios.post(BOT_URL, postData)
    .then((response) => {
      console.log(`Status Code: ${response.status}`);
    })
      
      
        
      
    })();
}

async function autoScroll(page){
    console.log("wait scrolling");
  await page.evaluate(async () => {
      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
  console.log("done scrolling");
}
app.get('/', (req, res) => {
    shopee("https://shopee.co.id/flash_sale");
    res.send("done to blash");
  });