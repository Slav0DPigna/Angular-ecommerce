package com.ecommerce.dto;

import lombok.Data;

@Data
public class PurchaseResponse {

    private final String orderTrackingNumber;//lombok crea costruttori solo per i campi final e @NotNull

}
