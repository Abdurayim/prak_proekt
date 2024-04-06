const {bot} = require('../bot')
const User = require('../../model/user')
const {adminKeyboard,userKeyboard} = require('../menu/keyboard')
const start = async(msg) =>{
    const chatId = msg.from.id

    let checkUser = await User.findOne({chatId}).lean()

    if(!checkUser){
        let newUser = new User({
            name:msg.from.first_name,
            username:msg.from.username,
            chatId,
            admin:false,
            status:true,
            createdAt: new Date(),
            action: 'request_contact'
        })
        await newUser.save()
        bot.sendMessage(chatId, `Assolom aleykum, hurmatli ${msg.from.first_name}. Iltimos telefon raqamingizni ulashing`,
        {
            reply_markup:{
                keyboard:[
                    [{
                        text:'Raqam registratsiya tugmasi▶️',
                        request_contact: true
                    }
                ]
                ],
                resize_keyboard:false
            }
        }
        )
    }else{
        await User.findByIdAndUpdate(checkUser._id,{
            ...checkUser,
            action: 'menu'
        },
        {new:true}
        )
        bot.sendMessage(chatId, `Menyuni tanlang ${checkUser.admin ? 'Admin': checkUser.name}`,{
            reply_markup:{
                keyboard: checkUser.admin ? adminKeyboard : userKeyboard,
                resize_keyboard:true
            },
        })
    }
}


const requestContact = async (msg)=>{
    const chatId = msg.from.id


    if(msg?.contact && msg?.contact?.phone_number){
        let user = await User.findOne({chatId}).lean()
        user.phone = msg.contact.phone_number
        user.admin = msg.contact.phone_number == '998998188798'
        user.action = `menu`
        await User.findByIdAndUpdate(user._id, user,{new:true})
        bot.sendMessage(chatId, `Katalogni tanlang ${user.admin ? 'Admin': user.name}`,{
            reply_markup:{
                keyboard: user.admin ? adminKeyboard : userKeyboard,
                resize_keyboard:true
            },
        })

    }
        //test
        else if (msg?.text && /^\+?\d+$/.test(msg.text)) {
            let user = await User.findOne({chatId}).lean()
            user.phone = msg.text
            user.admin = msg.text == '998998188798'
            user.action = `menu`
            await User.findByIdAndUpdate(user._id, user, {new: true})
            bot.sendMessage(chatId, `Katalogni tanlang ${user.admin ? 'Admin': user.name}`, {
                reply_markup: {
                    keyboard: user.admin ? adminKeyboard : userKeyboard,
                    resize_keyboard: true
                },
            })
        }


}


module.exports = {
    start,
    requestContact
}