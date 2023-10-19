import React from 'react';
import {useState, createContext } from 'react';

export const OrderFormContext = createContext({});

export const OrderFormProvider = props =>{
    const {children} = props;
    const [orderForm, setOrderForm] = useState({});
    
    return(
        <OrderFormContext.Provider value={{orderForm, setOrderForm}}>
            {children}
        </OrderFormContext.Provider>
    )
}