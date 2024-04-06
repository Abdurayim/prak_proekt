const {bot} = require('./bot')
const User = require('../model/user')
const { start, requestContact } = require('./helper/start')
const {get_all_users} = require('./helper/users')
const {get_all_categories, new_category, save_category} = require('./helper/category')
const {add_product_next} = require('./helper/product')
const { end_order } = require('./helper/order')


bot.on('message', async msg =>{
    const chatId = msg.from.id
    const text = msg.text
    
    const user = await User.findOne({chatId}).lean()

    if (text === '/start'){
        start(msg)
    }

if (text === '/savollar') {
    bot.sendMessage(chatId, `Ko'p so'raladigon savollar:\n\n1.Manzil qayerda?\n- Toshkent shahar ichidan onlayn tarzda yetkazib beramiz\n\n2.Dostavka bormi?\n- Dostavka Toshkent shahar ichida kun davomida yetkazib beramiz va yetkazib berish 30ming so'mni tashkil qiladi, qancha miqdordan olishidan qatiy nazar!\n\n3.Viloyatlarga dastavka bormi?\n -Viloyatlarga to'lovdan keyin 2 kun ichida Unex pochta orqali yetkazib beriladi!\n\n4.Adminga aloqaga chiqish?\n- Tel:+998 99 818 87 98,\ntg:@Mansurbek_admin`); 
}

if (msg.location && user.action == 'order'){
    end_order(chatId, msg.location)
}
if (user){
    if(user.action === 'request_contact' && !user.phone)
        requestContact(msg)

    
    if (text === 'Foydalanuvchilar'){
        get_all_users(msg)
        return
    }
    
    if (text === 'Katalog'){
        get_all_categories(chatId)
        return
    }

        if(user.action === 'add_category'){
            new_category(msg)
        }

        if(user.action.includes('edit_category-')){
            save_category(chatId,text)
        }

        

        if (user.action.includes('new_product_') && user.action !== 'new_product_img'){
            add_product_next(chatId,text,user.action.split('_')[2])
        }

        if(user.action == 'new_product_img'){
            if (msg.photo){
               add_product_next(chatId, msg.photo.at(-1).file_id,
               'img')
            } else  {
                bot.sendMessage(chatId,"Mahsulot rasmini oddiy rasm ko'rinishida yuklang!")
    
            }
        }
    
}

})