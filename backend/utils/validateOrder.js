function validateOrder(body){
   const errors=[];
   const {customer,items,paymentMethod} = body;
   
   //Payment method validation
   if(!['eft','cod'].includes(paymentMethod)){
      errors.push('Invalid payment method. Must be either "eft" or "cod".');
   }

   //Customer validation
   if(!customer){
        errors.push('Customer information is required.');
    }else{
        const required=['firstName','lastName','email','phone','address','city','province','postalCode'];
        for(const field of required){
            if(!customer[field] || !String(customer[field]).trim()){
                errors.push(`Customer ${field} is required.`);
            }     
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(customer.email && !emailRegex.test(customer.email)){
            errors.push('Customer email is invalid.');
        }
    }

    //Items validation
    if(!items || !Array.isArray(items) || items.length === 0){
        errors.push('At least one item is required in the order.');
    }else{
        items.forEach((item, i) => {
            if(!item.productId) errors.push(`items[${i}].productId is required.`);
            if(!item.name) errors.push(`items[${i}].name is required.`);
            if (typeof item.price !== 'number' || item.price < 0)
                errors.push(`items[${i}].price must be a non-negative number.`);
            if (typeof item.quantity !== 'number' || item.quantity < 1)
                errors.push(`items[${i}].quantity must be a positive number.`);
        });
    }

   return errors;
}

module.exports={validateOrder};