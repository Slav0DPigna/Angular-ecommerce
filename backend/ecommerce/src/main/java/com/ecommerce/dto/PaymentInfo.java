package com.ecommerce.dto;

import lombok.Data;

@Data
public class PaymentInfo {

    private int amount;//si riferisce ai centesimi totatali per questo é int
    private String currency;
    private String receiptEmail;
}
