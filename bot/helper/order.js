const Product = require('../../model/product')
const User = require('../../model/user')
const Order = require('../../model/order')

const {bot} = require('../bot')



const ready_order = async(chatId,product,count)=>{
    let user = await User.findOne({chatId}).lean()

    let orders = await Order.find({user,status:0}).lean()

    await Promise.all(orders.map(async(order)=>{
        await Order.findByIdAndDelete(order._id)
    }))

    await User.findByIdAndUpdate(user._id,{
        ...user,
        action: 'order'
    }, {new:true})

    const newOrder = new Order({
        user:user._id,
        product,
        count,
        status: 0 ,

    })

    await newOrder.save() 

    bot.sendMessage(chatId, `Mahsulotni buyurtma qilish uchun manzilni(lokatsiyani) jo'nating`,
        {
            reply_markup:{
                keyboard:[
                    [{
                        text:"Lokatsiyani jo'natish",
                        request_location:true

                    }]
                ],
                resize_keyboard:true,
                one_time_keyboard:true
            }
        }
    )
}

const end_order = async(chatId,location) =>{
    const user = await User.findOne({chatId}).lean()
    let admin = await User.findOne({admin:true}).lean()

    await User.findByIdAndUpdate(user._id,{
        ...user,
        action: 'end_order'
    },{new:true})

    const order = await Order.findOne({
        user:user._id,
        status: 0 
    }).populate(['product']).lean()
    if (order){
        await Order.findByIdAndUpdate(order._id,{
            ...order,
            location,
            status:1
        }, {new:true})

        await bot.sendMessage(chatId, `Buyurtmangiz jo'natildi.Tez orada menedjerimiz siz bilan bog'lanadi!`,{
            reply_markup:{
                remove_keyboard:true
            }
        })
        await bot.sendMessage(admin.chatId, `Yangi buyurtma!\nBuyurtmachi: ${user.name}\nTgsi:@${user.username}\nNomer: ${user.phone}\nMahsulot: ${order.product.title}\nSoni: ${order.count} ta\nUmumiy narxi:${order.count * order.product.price} so'm `,{
            reply_markup:{
                inline_keyboard:[
                   [ 
                    {
                        text: 'Bekor qilish',
                        callback_data: `cancel_order-${order._id}`
                    },
                    {
                        text: 'Qabul qilish',
                        callback_data: `success_order-${order._id}`
                    }
                ],
                [
                    {
                        text: 'Lokatsiyani olish',
                        callback_data: `map_order-${order._id}`
                    }
                ]
                ]
            }
        })
    }

}


const change_order = async (chatId,id,status) =>{
    let admin = await User.findOne({chatId}).lean()

    if(admin.admin){
        let order = await Order.findById(id).populate(['user', 'product']).lean()
        await Order.findByIdAndUpdate(order._id,{
            ...order,
            status,
            createdAt:  new Date()
        }, {new:true})
        const msg = status == 2 ? 'Buyurtmangiz qabul qilindi' : "Buyurtmangiz bekor qilindi"
        await bot.sendMessage(order.user.chatId, msg)
        await bot.sendMessage(chatId,`Buyurtma holati o'zgardi`)
    }else{
        bot.sendMessage(chatId,'Sizga mumkinmas')
    }
}


const show_location = async (chatId,_id)=>{
    let user = await User.findOne({chatId}).lean()

    if(user.admin){
        let order = await Order.findById(_id).lean()
        bot.sendLocation(chatId,order?.location?.latitude, order?.location?.longitude)
    }else{
        bot.sendMessage(chatId,'Sizga bu yerga kirish mumkinmas')
    }
}



module.exports = {
    ready_order,
    end_order,
    show_location,
    change_order
}