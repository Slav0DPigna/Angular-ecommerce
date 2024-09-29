package com.ecommerce.entity;


import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name="product_category")
@Getter
@Setter
//Non uso @data con lombok perché in questo caso ha un bug noto che devo andare a cercare
public class ProductCategory {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name")
    private String categoryName;

    @OneToMany(cascade = CascadeType.ALL,mappedBy = "category")
    private Set<Product> products;

}
