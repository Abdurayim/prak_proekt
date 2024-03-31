const {bot} = require('./bot')
const User = require('../model/user')
const { add_category, pagination_category,
    show_category,remove_category,
     edit_category,
     get_all_categories
     } = require('./helper/category')
const {add_product,show_product,
delete_product}= require('./helper/product')
const { ready_order, show_location, change_order } = require('./helper/order')

bot.on('callback_query', async query =>{ 
    const {data} = query
    const chatId = query.from.id 

    bot.answerCallbackQuery(query.id);

    if (data === 'add_category'){
        add_category(chatId)
    }

    if(data.includes('map_order-')){
        let id = data.split('-')[1]
        show_location(chatId,id)
        return;
    }

    if (data.includes('success_order-')){
        let id = data.split('-')
        change_order(chatId,id[1],2)
        return
    }
    if (data.includes('cancel_order-')){
        let id = data.split('-')
        change_order(chatId,id[1],3)
        return
    }

    if (data.includes('order-')){
        let id = data.split('-')
        ready_order(chatId,id[1],id[2])
    }
    if(data.includes('more_count-')){
        let id = data.split('-')
        show_product(chatId,id[1],+id[2]+1,query.message.message_id)
    }
    if(data.includes('less_count-')){
        let id = data.split('-')
        if (id[2]>1){
            show_product(chatId,id[1],+id[2]-1,query.message.message_id)
        }
    }
    if (['next_category', 'back_category'].includes(data)){
        pagination_category(chatId, data, query.message.message_id)
    }
    if (data.includes('category_')){
        let id = data.split('_')[1]
        show_category(chatId, id)
    }
    

    if (data.includes('del_category-')){
        let id = data.split('-')[1];
        remove_category(chatId, id)
    }
    if (data.includes('edit_category-')){
        let id = data.split('-')[1]
        edit_category(chatId, id)
    }

    if(data.includes('add_product-')){
        let id = data.split('-')[1]
        add_product(chatId, id)
    }

    if(data.includes('product_')){
        let id = data.split('_')[1]
        show_product(chatId,id)
    }

    if (data.includes('del_product-')){
        let id = data.split('-')[1]
        delete_product(chatId,id)
    }
    if (data.includes('rem_product-')){
        let id = data.split('-')[1]
        delete_product(chatId,id,true)
    }

    
    

    if (data === 'catalog'){
        get_all_categories(chatId)
    }



})