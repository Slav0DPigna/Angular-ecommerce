package com.ecommerce.service;

import com.ecommerce.dao.CustomerRepository;
import com.ecommerce.dto.PaymentInfo;
import com.ecommerce.dto.Purchase;
import com.ecommerce.dto.PurchaseResponse;
import com.ecommerce.entity.Customer;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository, @Value("${stripe.key.secret}") String secretKey) {
        this.customerRepository = customerRepository;
        Stripe.apiKey=secretKey;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        //recupera le informazioni dell'ordine da dto
        Order order = purchase.getOrder();

        //genera un numero di tracciamento
        String orderTrackingNumber= getOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        //aggiungo gli ordini da OrderItems
        Set<OrderItem> orderItems= purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));//modo interessante per usare il forEach molto carino e funzionale

        //aggiungo gli indirizzi all'ordine
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        //aggiungo il customer agli ordini
        Customer customer = purchase.getCustomer();

        //controllo se esiste un customer
        String theEmail=customer.getEmail();
        Customer customerFromDB= customerRepository.findByEmail(theEmail);
        if(customerFromDB!=null){
            customer=customerFromDB;
        }
        customer.add(order);

        //salviamo tutto nel db
        customerRepository.save(customer);

        //diamo una risposta
        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
        List<String> payment_methods_types= new ArrayList<>();
        payment_methods_types.add("card");
        Map<String, Object> params= new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types", payment_methods_types);
        params.put("description","Slavo's shop purchase");
        System.out.println(paymentInfo.getReceiptEmail());
        if(paymentInfo.getReceiptEmail()!=null) {
            System.out.println(paymentInfo.getReceiptEmail());
            params.put("receipt_email", paymentInfo.getReceiptEmail());
            System.out.println("É andato tutto bene");
        }else {
            System.out.println("Qualcosa é andato storto sulle mail");
        }
        return PaymentIntent.create(params);
    }

    private String getOrderTrackingNumber() {
        //genero un UUID casuale (UUID version-4) (UUID= Universal Unique IDentifie)
        return UUID.randomUUID().toString();
    }
}
